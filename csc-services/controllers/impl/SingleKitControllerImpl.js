const AccordionController  = require("./helpers/AccordionController");
const cscServices = require('csc-services');
const KitsService = cscServices.KitsService;
const OrderService = cscServices.OrderService;
const ShipmentService = cscServices.ShipmentService;
const FileDownloaderService = cscServices.FileDownloaderService;
const viewModelResolver = cscServices.viewModelResolver;
const momentService = cscServices.momentService;
const eventBusService = cscServices.EventBusService;
const { Commons, Topics, Roles, FoldersEnum } = cscServices.constants;
const {kitsStatusesEnum,kitsMessagesEnum, kitsPendingActionEnum} = cscServices.constants.kit;
const statusesService = cscServices.StatusesService;
const {getCommunicationServiceInstance} = cscServices.CommunicationService;

class SingleKitControllerImpl extends AccordionController {

  constructor(actor, ...props) {
    super(...props);
    this.actor = actor;

    this.kitsService = new KitsService();
    this.ordersService = new OrderService();
    this.shipmentService = new ShipmentService();
    this.communicationService = getCommunicationServiceInstance();
    this.fileDownloaderService = new FileDownloaderService();
    this.initViewModel();
    this.openFirstAccordion();
    this.attachEventListeners();

  }

  attachEventListeners() {
    this.toggleAccordionItemHandler();
    this.navigationHandlers();
    this.attachDownloadHandler();
    this.attachSiteEventHandlers();
  }

  attachDownloadHandler() {
    this.onTagClick('download-certification-of-destruction-file', async (model) => {

      window.WebCardinal.loader.hidden = false;
      const fileName = this.model.kitModel.kit.kitDestroyDetails.certificationOfDestructionName;
      const path = FoldersEnum.Kits + '/' + this.model.uid + '/' + 'files';

      await this.fileDownloaderService.prepareDownloadFromDsu(path, fileName);
      this.fileDownloaderService.downloadFileToDevice(fileName);
      window.WebCardinal.loader.hidden = true;

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
      let modalOpen = false;

      let updateViewHandler = ()=>{
        modalOpen = false;
        this.initViewModel();
      };

      eventBusService.addEventListener(Topics.RefreshKits + this.model.kitModel.kit.kitId, ()=>{
        if (!modalOpen) {
          modalOpen = true;
          let title = 'Kit Updated';
          let content = 'Kit was updated';
          let modalOptions = {
            disableExpanding: true,
            disableClosing: true,
            disableCancelButton: true,
            confirmButtonText: 'Update View',
            id: 'confirm-modal'
          };
          this.showModal(content, title, updateViewHandler, updateViewHandler, modalOptions);
        }
      });
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
      this.model.kitModel.kit.isConfirmDestructionDisabled = true;
      this.navigateToPageTag('destruction-confirmation', {
        kit: {
          kitId: this.model.kitModel.kit.kitId,
          ...this.model.toObject('kitModel.kit')
        }
      });
    });

    this.onTagClick('request-relabeling',  (model, target, event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      this.showModal(
        'Do you want to request relabeling?',
        'Request Relabeling',
        this.requestRelabelingKit.bind(this),
        () => {

        },
        {
          disableExpanding: true,
          cancelButtonText: 'Cancel',
          confirmButtonText: 'Yes',
          id: 'confirm-modal'
        }
      );
      console.log("Pressed Request Relabeling");

    });

    this.onTagClick('block-kit', (model, target, event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      this.showModal(
        'Do you want to block kit?',
        'Block Kit',
        this.blockKit.bind(this),
        () => {},
        {
          disableExpanding: true,
          cancelButtonText: 'Cancel',
          confirmButtonText: 'Yes',
          id: 'confirm-modal'
        }
      );
      console.log("Pressed Block kit");

    });

    this.onTagClick('make-kit-available', () => {
      this.navigateToPageTag('make-kit-available', {
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

    const currentDate = new Date();
    const studyTo = new Date(new Date(model.kitModel.kit.studyData.studyDurationTo).getTime() + 86400000);
    model.kitModel.kit.studyHasEnded = currentDate > studyTo;

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

    this.model.addExpression(
      "isCertificationOfDestructionFileEmpty",
      () => {
        return this.model.kit.form.certificationOfDestruction === null;
      },
      "kitModel.form.certificationOfDestruction"
    );

    this.model.kitModel.kit.isBlockKitDisabled = false;
    this.model.kitModel.kit.isRequestKitDestructionDisabled = false;
    this.model.kitModel.kit.isReconcileKitDisabled = false;
    this.model.kitModel.kit.isReturnKitDisabled = false;
    this.model.kitModel.kit.isConfirmDestructionDisabled = false;

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
    actions.canRequestRelabelingKit = (kit.status_value === kitsStatusesEnum.AvailableForAssignment);
    actions.relabeledAlreadyRequested = typeof kit.hasRequestRelabeled === 'boolean' && kit.hasRequestRelabeled;
    actions.canBlockKit = kit.status_value === kitsStatusesEnum.RequestRelabeling;
    actions.blockKitAlreadyRequested = typeof kit.hasBlockKit === 'boolean' && kit.hasRequestRelabeled;
    actions.canMakeKitAvailable = kit.status_value === kitsStatusesEnum.BlockedForRelabeling;
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

      const statuses = statusesService.getKitStatuses();
      const normalStatuses = statuses.normalKitStatuses;
      const approvedStatuses = statuses.approvedKitStatuses;
      const cancelledStatuses = statuses.canceledKitsStatuses;
      const inQuarantineStatues = statuses.quarantineStatuses;
      const pendingDestructionStatuses = statuses.pendingDestructionStatuses;
      const requestRelabelingStatuses = statuses.requestRelabelingStatuses;
      const blockedStatuses = statuses.blockedStatuses;

      data.status_approved = approvedStatuses.indexOf(data.status_value) !== -1;
      data.status_cancelled = cancelledStatuses.indexOf(data.status_value) !== -1;
      data.status_normal = normalStatuses.indexOf(data.status_value) !== -1;
      data.status_quarantine = inQuarantineStatues.indexOf(data.status_value) !== -1;
      data.status_pending_destruction = pendingDestructionStatuses.indexOf(data.status_value) !== -1;
      data.status_request_relabeling = requestRelabelingStatuses.indexOf(data.status_value) !== -1;
      data.status_blocked = blockedStatuses.indexOf(data.status_value) !== -1;

      if (data.studyHasEnded && data.status_normal) {
        data.pending_action = kitsPendingActionEnum.InQuarantine;
      } else {
        data.pending_action = this.getPendingAction(data.status_value);
      }

      data.contextualContent = {
         afterReceived: data.status.findIndex(el => el.status === kitsStatusesEnum.Received) !== -1,
         afterAvailableForAssignment: data.status.findIndex(el => el.status === kitsStatusesEnum.AvailableForAssignment) !== -1,
         afterAssigned: data.status.findIndex(el => el.status === kitsStatusesEnum.Assigned) !== -1,
         afterDispensed: data.status.findIndex(el => el.status === kitsStatusesEnum.Dispensed) !== -1,
         afterReturned: data.status.findIndex(el => el.status === kitsStatusesEnum.Returned) !== -1,
         afterQuarantined:data.status.findIndex(el => el.status === kitsStatusesEnum.InQuarantine) !== -1,
         afterDestroyedConfirmation:data.status.findIndex(el => el.status === kitsStatusesEnum.Destroyed) !== -1,
         afterRequestRelabeling:data.status.findIndex(el => el.status === kitsStatusesEnum.BlockedForRelabeling) !== -1
       };

      if (data.contextualContent.afterDestroyedConfirmation) {
        data.kitDestroyDetails.hasCertificationOfDestruction = typeof data.kitDestroyDetails.certificationOfDestructionName !== 'undefined';
      }
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
      case kitsStatusesEnum.RequestRelabeling:
        return kitsPendingActionEnum.RequestRelabeling;
    }

    return kitsPendingActionEnum.NoFurtherActionsRequired;
  }

  async returnKit(){
    window.WebCardinal.loader.hidden = false;

    this.model.kitModel.kit.isReturnKitDisabled = true;

    const returnedData = {
      returnedDate:Date.now()
    }
    await this.kitsService.updateKit(this.model.uid, kitsStatusesEnum.Returned, returnedData);
    await this.initViewModel();
    this.showErrorModalAndRedirect('Kit is marked as Returned', 'Kit Returned', {
      tag: 'kit',
      state: { uid: this.model.uid }
    }, 2000);

    window.WebCardinal.loader.hidden = true;
  }

  async reconcileKit(){
    window.WebCardinal.loader.hidden = false;

    this.model.kitModel.kit.isReconcileKitDisabled = true;

    await this.kitsService.updateKit(this.model.uid, kitsStatusesEnum.Reconciled,{});
    await this.initViewModel();
    this.showErrorModalAndRedirect('Kit is marked as Reconciled', 'Kit Reconciled', {
      tag: 'kit',
      state: { uid: this.model.uid }
    }, 2000);
    window.WebCardinal.loader.hidden = true;
  }

  async requestKitDestruction(){
    window.WebCardinal.loader.hidden = false;

    this.model.kitModel.kit.isRequestKitDestructionDisabled = true;

    await this.kitsService.updateKit(this.model.uid, kitsStatusesEnum.PendingDestruction,{});
    await this.initViewModel();
    this.showErrorModalAndRedirect('Kit destruction was requested', 'Destruction Request', {
      tag: 'kit',
      state: { uid: this.model.uid }
    }, 2000);
    window.WebCardinal.loader.hidden = true;
  }

  async requestRelabelingKit(){
    if(this.actor === Roles.Sponsor) {
      window.WebCardinal.loader.hidden = false;

      const shipments = await this.shipmentService.getShipments();
      const shipment = shipments.find(i =>{ return i.shipmentId === this.model.kitModel.kit.shipmentId });
      const siteId = shipment.siteId;
      const sponsorId = shipment.sponsorId;
      const studyKits = await this.kitsService.getStudyKits(this.model.kitModel.kit.studyId);
      let kit = studyKits.kits.find( kit => { return kit.uid  === this.model.uid });
      kit.hasRequestRelabeled =  true;

      await this.kitsService.addStudyKitDataToDb(this.model.kitModel.kit.studyId, studyKits);
      // Sponsor sends message to site in order to update the kit.
      await this.communicationService.sendMessage(siteId, {
        operation: kitsMessagesEnum.KitRequestRelabeled,
        data: { kitSSI: this.model.uid , sponsorId: sponsorId, kitId: this.model.kitModel.kit.kitId},
        shortDescription: kitsMessagesEnum.KitRequestRelabeled,
      });
      await this.initViewModel();
      window.WebCardinal.loader.hidden = true;
    }
  }

  async blockKit(){
    if(this.actor === Roles.Site) {
      window.WebCardinal.loader.hidden = false;


      this.model.kitModel.kit.isBlockKitDisabled = true;

      // Needed
      const shipments = await this.shipmentService.getShipments();
      const shipment = shipments.find(i =>{ return i.shipmentId === this.model.kitModel.kit.shipmentId });
      const sponsorId = shipment.sponsorId;

      // Site updates the kit
      const data = await this.kitsService.updateKit(this.model.uid, kitsStatusesEnum.BlockedForRelabeling);


      // Site send a message to sponsor that the kit is blocked.
      await this.communicationService.sendMessage(sponsorId,{
        operation: kitsMessagesEnum.kitBlockedForRelabeling,
        data: {kitSSI: this.model.uid, kitId: this.model.kitModel.kit.kitId},
        shortDescription: kitsMessagesEnum.kitBlockedForRelabeling,
      });

      await this.initViewModel();

      window.WebCardinal.loader.hidden = true;
    }
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
