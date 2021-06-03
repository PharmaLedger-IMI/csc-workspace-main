const { WebcController } = WebCardinal.controllers;

export default class NewOrderController extends WebcController {

    constructor(...props) {

        super(...props);

        this.model = {
            wizard_form: [
                { id: "wizard_form_step_1" , holder_id: "wizard_form_step_1_holder", name : "Order Details" , visible: true , validated: false },
                { id: "wizard_form_step_2" , holder_id: "wizard_form_step_2_holder", name : "Attach Documents" , visible: false , validated: false},
                { id: "wizard_form_step_3" , holder_id: "wizard_form_step_3_holder", name : "Comments" , visible: false, validated: false},
                { id: "wizard_form_step_4" , holder_id: "wizard_form_step_4_holder", name : "Confirmation" , visible: false, validated: false}
            ],
            form: {
                inputs: {
                    sponsor_id: {
                        label: "Sponsor ID",
                        name: "sponsor_id",
                        required: true,
                        placeholder: "Sponsor ID...",
                        value: ''
                    },
                    delivery_date: {
                        label: "Delivery Date/Time",
                        date: {
                            name: "delivery_date",
                            required: true,
                            value: ''
                        },
                        time: {
                            name: "delivery_time",
                            required: true,
                            value: ''
                        }
                    },
                    target_cmo_id: {
                        label: "Target CMO ID",
                        name: "target_cmo_id",
                        placeholder: "Select Target CMO ID...",
                        required: true,
                        options: [
                            { label: "ID 1",  value: "1"},
                            { label: "ID 2",  value: "2"},
                            { label: "ID 3",  value: "3"}
                        ]
                    },
                    study_id: {
                        label: "Study ID",
                        name: "study_id",
                        required: true,
                        placeholder: "e.g ABC123X56789",
                        value: ''
                    },
                    order_id: {
                        label: "Order ID",
                        name: "order_id",
                        required: true,
                        placeholder: "e.g O-000001234",
                        value: ''
                    },
                    kit_id_list: {
                        label: "Kit ID List (xlsx)",
                        name: "kit_id_list",
                        required: true,
                        placeholder: "No File",
                        value: ''
                    },
                    site_id: {
                        label: "Site ID",
                        name: "site_id",
                        placeholder: "Select Site ID...",
                        required: true,
                        options: [
                            { label: "Site ID 1",  value: "1"},
                            { label: "Site ID 2",  value: "2"},
                            { label: "Site ID 3",  value: "3"}
                        ]
                    },
                }
            }
        };


        //When you click step 1
        this.onTagEvent('wizard_form_step_1', 'click', (e) => {
            makeStepActive("wizard_form_step_1", "wizard_form_step_1_holder" , e);
        });

        //When you click step 2
        this.onTagEvent('wizard_form_step_2', 'click', (e) => {
            makeStepActive("wizard_form_step_2", "wizard_form_step_2_holder" , e);
        });

        //When you click step 3
        this.onTagEvent('wizard_form_step_3', 'click', (e) => {
            makeStepActive("wizard_form_step_3", "wizard_form_step_3_holder" , e);
        });

        //When you click step 4
        this.onTagEvent('wizard_form_step_4', 'click', (e) => {
            makeStepActive("wizard_form_step_4", "wizard_form_step_4_holder" , e);
        });


        //Add active menu class to element
        function makeStepActive( step_id, step_holder_id , e ) {

            if(e){
                e.wizard_form.forEach( (item) => {
                    document.getElementById(item.id).classList.remove("new-order-wizard-active");
                    hideStep(item.holder_id);
                });

                document.getElementById(step_id).classList.add("new-order-wizard-active");

                showStep(step_holder_id);

            }
        }

        //Remove active menu class to element
        function makeMenuInActive( element ){
            document.getElementById(element).classList.remove("dashboard-tab-active");
        }

        function hideStep( item ){
            var el = document.getElementById(item);
            el.classList.remove("show-step");
            el.classList.add("hide-step");
        }

        function showStep( item ){
            var el = document.getElementById(item);
            el.classList.remove("hide-step");
            el.classList.add("show-step");
        }

    }





}
