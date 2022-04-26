const AccordionController  = require("./helpers/AccordionController");
const cscServices = require('csc-services');
const KitsService = cscServices.KitsService;
const FileDownloaderService = cscServices.FileDownloaderService;
const viewModelResolver = cscServices.viewModelResolver;
const momentService = cscServices.momentService;
const eventBusService = cscServices.EventBusService;
const { Commons, Topics, Roles, FoldersEnum } = cscServices.constants;
const {kitsStatusesEnum, kitsPendingActionEnum} = cscServices.constants.kit;
const statusesService = cscServices.StatusesService;

class SingleKitControllerImpl extends AccordionController {

  constructor(actor, ...props) {
    super(...props);
    this.actor = actor;

    this.kitsService = new KitsService(this.DSUStorage);
    this.fileDownloaderService = new FileDownloaderService(this.DSUStorage);
    this.initViewModel();
    this.openFirstAccordion();
    this.attachEventListeners();
  }

  attachEventListeners() {
    this.toggleAccordionItemHandler();
    this.navigationHandlers();
    this.attachDownloadHandler();
  }

  attachDownloadHandler() {
    this.onTagClick('download-certification-of-destruction-file', async (model) => {

      window.WebCardinal.loader.hidden = false;
      const fileName = this.model.kitModel.kit.kitDestroyDetails.certificationOfDestructionName;
      const keySSI  = this.model.kitModel.kit.kitDestroyDetails.certificationOfDestructionSSI;
      const uid = this.kitsService.getUidFromSSI(keySSI);
      const path = FoldersEnum.CertificationOfDestruction + '/' + uid + '/' + 'files';

      const downloadFile = async ()=>{
        try{
          await this.fileDownloaderService.prepareDownloadFromDsu(path, fileName);
        }
        catch (e){
          await this.kitsService.mountCertificationOfDestruction(keySSI);
          downloadFile(path, fileName, keySSI);
        }
        this.fileDownloaderService.downloadFileToDevice(fileName);
        window.WebCardinal.loader.hidden = true;
      }

      await downloadFile();

    });
  }

  navigationHandlers() {
    this.onTagClick('dashboard', () => {
      this.navigateToPageTag('dashboard', { tab: Topics.Shipment });
    });

    this.onTagClick('kits-management', () => {
      this.navigateToPageTag('dashboard', { tab: Topics.Kits });
    });

    this.onTagClick('view-study-kits', () => {
      this.navigateToPageTag('study-kits', {
        studyId: this.model.kitModel.kit.studyId,
        orderId: this.model.kitModel.kit.orderId
      });
    });

  }

  attachRefreshListeners() {
    if (!this.addedRefreshListeners) {
      this.addedRefreshListeners = true;
      this.refreshModalOpened = false;
      eventBusService.addEventListener(Topics.RefreshKits + this.model.kitModel.kit.kitId, this.initViewModel.bind(this));
    }
  }


  attachSiteEventHandlers(){
    this.onTagClick('manage-kit', () => {
      this.navigateToPageTag('scan-kit', {
        kit: {
          kitId: this.model.kitModel.kit.kitId,
          ...this.model.toObject('kitModel.kit')
        }
      });
    });

    this.onTagClick('quarantine-kit', () => {
      this.navigateToPageTag('quarantine-kit', {
        kit: {
          kitId: this.model.kitModel.kit.kitId,
          ...this.model.toObject('kitModel.kit')
        }
      });
    });

    this.onTagClick('assign-kit', () => {
      this.navigateToPageTag('assign-kit', {
        kit: {
          kitId: this.model.kitModel.kit.kitId,
          ...this.model.toObject('kitModel.kit')
        }
      });
    });

    this.onTagClick('dispense-kit', () => {
      this.navigateToPageTag('dispense-kit', {
        kit: {
          kitId: this.model.kitModel.kit.kitId,
          ...this.model.toObject('kitModel.kit')
        }
      });
    });

    this.onTagClick('return-kit', () => {
      this.showModal(
        'Do you want to set this kit as \'Returned\'?',
        'Kit Returning',
        this.returnKit.bind(this),
        () => {

        },
        {
          disableExpanding: true,
          cancelButtonText: 'Cancel',
          confirmButtonText: 'Yes, Kit was returned',
          id: 'confirm-modal'
        }
      );
    });

    this.onTagClick('reconcile-kit', () => {
      this.showModal(
        'Do you want to set this kit as \'Reconciled\'?',
        'Kit Returning',
        this.reconcileKit.bind(this),
        () => {

        },
        {
          disableExpanding: true,
          cancelButtonText: 'Cancel',
          confirmButtonText: 'Yes, mark kit as reconciled',
          id: 'confirm-modal'
        }
      );
    });

    this.onTagClick('request-kit-destruction', () => {
      this.showModal(
        'Do you want to request kit destruction?',
        'Kit Destruction',
        this.requestKitDestruction.bind(this),
        () => {

        },
        {
          disableExpanding: true,
          cancelButtonText: 'Cancel',
          confirmButtonText: 'Yes, request destruction',
          id: 'confirm-modal'
        }
      );
    });

    this.onTagClick('confirm-kit-destruction', () => {
      this.navigateToPageTag('destruction-confirmation', {
        kit: {
          kitId: this.model.kitModel.kit.kitId,
          ...this.model.toObject('kitModel.kit')
        }
      });
    });


    this.onTagEvent('history-button', 'click', (e) => {
        this.onShowHistoryClick();
    });

  }

  async initViewModel() {
    const model = {
      kitModel: viewModelResolver('kit')
    };

    let { uid } = this.history.location.state;
    model.uid = uid;
    model.kitModel.kit = await this.kitsService.getKitDetails(model.uid);
    model.kitModel.kit = { ...this.transformKitData(model.kitModel.kit) };

    if (model.kitModel.kit.shipmentComments) {
      model.kitModel.kit.comments = this.getShipmentComments(model.kitModel.kit);
    }
    if (model.kitModel.kit.kitComment) {
      model.kitModel.kit.kitcomments = this.getKitComments(model.kitModel.kit);
    }
    if(this.actor === Roles.Site){
      model.actions = this.setKitActions(model.kitModel.kit);
    }

    if(this.actor === Roles.Sponsor){
      model.actions = this.setKitActions(model.kitModel.kit);
    }

    this.model = model;
    this.attachRefreshListeners();
  }

  setKitActions(kit) {
    const actions = {};
    actions.canManageKit = kit.status_value === kitsStatusesEnum.Received;
    actions.canQuarantineKit = [kitsStatusesEnum.Received, kitsStatusesEnum.AvailableForAssignment, kitsStatusesEnum.Assigned].includes(kit.status_value);
    actions.canRequestDestruction = kit.status_value === kitsStatusesEnum.InQuarantine;
    actions.canConfirmDestruction = kit.status_value === kitsStatusesEnum.PendingDestruction;
    actions.canAssignKit = kit.status_value === kitsStatusesEnum.AvailableForAssignment;
    actions.canDispenseKit = kit.status_value === kitsStatusesEnum.Assigned;
    actions.canReturnKit = kit.status_value === kitsStatusesEnum.Dispensed;
    actions.canReconcileKit = kit.status_value === kitsStatusesEnum.Returned;
    this.attachSiteEventHandlers();
    return actions;
  }

  getShipmentComments(kit) {
    let comments = kit.shipmentComments;
    comments.forEach((comment) => {
      comment.date = momentService(comment.date).format(Commons.DateTimeFormatPattern);
    });
    return comments;
  }

  getKitComments(kit) {
    let comment = kit.kitComment;
    comment.date = momentService(comment.date).format(Commons.DateTimeFormatPattern);
    return comment;
  }

  getDateTime(timestamp) {
    return {
      date: momentService(timestamp).format(Commons.YMDDateTimeFormatPattern),
      time: momentService(timestamp).format(Commons.HourFormatPattern)
    };
  }

  transformKitData(data) {
    if (data) {
      data.status_value = data.status.sort((function (a, b) {
        return new Date(b.date) - new Date(a.date);
      }))[0].status;

      data.status_date = momentService(data.status.sort((function (a, b) {
        return new Date(b.date) - new Date(a.date);
      }))[0].date).format(Commons.DateTimeFormatPattern);

      if (data.receivedDateTime) {
        data.receivedDateTime = this.getDateTime(data.receivedDateTime)
      }

      if(data.returnedDate){
        data.returnedDate = this.getDateTime(data.returnedDate)
      }

      data.pending_action = this.getPendingAction(data.status_value);
      const statuses = statusesService.getKitStatuses();
      const normalStatuses = statuses.normalKitStatuses;
      const approvedStatuses = statuses.approvedKitStatuses;
      const cancelledStatuses = statuses.canceledKitsStatuses;
      const inQuarantineStatues = statuses.quarantineStatuses;
      const pendingDestructionStatuses = statuses.pendingDestructionStatuses;
      data.status_approved = approvedStatuses.indexOf(data.status_value) !== -1;
      data.status_cancelled = cancelledStatuses.indexOf(data.status_value) !== -1;
      data.status_normal = normalStatuses.indexOf(data.status_value) !== -1;
      data.status_quarantine = inQuarantineStatues.indexOf(data.status_value) !== -1;
      data.status_pending_destruction = pendingDestructionStatuses.indexOf(data.status_value) !== -1;
      data.contextualContent = {
         afterReceived: data.status.findIndex(el => el.status === kitsStatusesEnum.Received) !== -1,
         afterAvailableForAssignment: data.status.findIndex(el => el.status === kitsStatusesEnum.AvailableForAssignment) !== -1,
         afterAssigned: data.status.findIndex(el => el.status === kitsStatusesEnum.Assigned) !== -1,
         afterDispensed: data.status.findIndex(el => el.status === kitsStatusesEnum.Dispensed) !== -1,
         afterReturned: data.status.findIndex(el => el.status === kitsStatusesEnum.Returned) !== -1,
         afterQuarantined:data.status.findIndex(el => el.status === kitsStatusesEnum.InQuarantine) !== -1,
         afterDestroyedConfirmation:data.status.findIndex(el => el.status === kitsStatusesEnum.Destroyed) !== -1
       };
      return data;
    }
    return {};
  }

  getPendingAction(status_value) {
    switch (status_value) {
      case kitsStatusesEnum.Received:
        return kitsPendingActionEnum.ManageKit;
      case kitsStatusesEnum.AvailableForAssignment:
        return kitsPendingActionEnum.Assign;
      case kitsStatusesEnum.Assigned:
        return kitsPendingActionEnum.Dispense;
      case kitsStatusesEnum.Dispensed:
        return kitsPendingActionEnum.Return;
      case kitsStatusesEnum.Returned:
        return kitsPendingActionEnum.Reconcile;
      case kitsStatusesEnum.InQuarantine:
        return kitsPendingActionEnum.PendingDestruction;
      case kitsStatusesEnum.PendingDestruction:
        return kitsPendingActionEnum.SubmitDestructionDetails;
    }

    return kitsPendingActionEnum.NoFurtherActionsRequired;
  }

  async returnKit(){
    window.WebCardinal.loader.hidden = false;
    const returnedData = {
      returnedDate:Date.now()
    }
    await this.kitsService.updateKit(this.model.uid, kitsStatusesEnum.Returned, returnedData);
    eventBusService.emitEventListeners(Topics.RefreshKits + this.model.kitModel.kit.kitId, null);

    this.showErrorModalAndRedirect('Kit is marked as Returned', 'Kit Returned', {
      tag: 'kit',
      state: { uid: this.model.uid }
    }, 2000);

    window.WebCardinal.loader.hidden = true;
  }

  async reconcileKit(){
    window.WebCardinal.loader.hidden = false;
    await this.kitsService.updateKit(this.model.uid, kitsStatusesEnum.Reconciled,{});
    eventBusService.emitEventListeners(Topics.RefreshKits + this.model.kitModel.kit.kitId, null);
    this.showErrorModalAndRedirect('Kit is marked as Reconciled', 'Kit Reconciled', {
      tag: 'kit',
      state: { uid: this.model.uid }
    }, 2000);
    window.WebCardinal.loader.hidden = true;
  }

  async requestKitDestruction(){
    window.WebCardinal.loader.hidden = false;
    await this.kitsService.updateKit(this.model.uid, kitsStatusesEnum.PendingDestruction,{});
    eventBusService.emitEventListeners(Topics.RefreshKits + this.model.kitModel.kit.kitId, null);
    this.showErrorModalAndRedirect('Kit destruction was requested', 'Destruction Request', {
      tag: 'kit',
      state: { uid: this.model.uid }
    }, 2000);
    window.WebCardinal.loader.hidden = true;
  }

  onShowHistoryClick() {
      let { kitModel } = this.model.toObject();

      const historyModel = {
        kit: kitModel.kit,
        currentPage: Topics.Kits
      };

      this.createWebcModal({
        template: 'kitHistoryModal',
        controller: 'KitHistoryModalController',
        model: historyModel,
        disableBackdropClosing: false,
        disableFooter: true,
        disableExpanding: true,
        disableClosing: false,
        disableCancelButton: true,
        expanded: false,
        centered: true
      });
    }
}

const controllersRegistry = require('../ControllersRegistry').getControllersRegistry();
controllersRegistry.registerController('SingleKitController', SingleKitControllerImpl);
