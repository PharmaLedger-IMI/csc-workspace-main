const { WebcController } = WebCardinal.controllers;

export default class NewOrderController extends WebcController {

    constructor(element, history) {

        super(element, history);

        this.model = {
            wizard_form: [
                { id: "wizard_form_step_1" , holder_id: "wizard_form_step_1_holder", name : "Order Details" , visible: true , validated: false },
                { id: "wizard_form_step_2" , holder_id: "wizard_form_step_2_holder", name : "Attach Documents" , visible: false , validated: false},
                { id: "wizard_form_step_3" , holder_id: "wizard_form_step_3_holder", name : "Comments" , visible: false, validated: false},
                { id: "wizard_form_step_4" , holder_id: "wizard_form_step_4_holder", name : "Confirmation" , visible: false, validated: false}
            ],
            wizard_form_navigation:[
                { id: "from_step_1_to_2", name: "Next", visible: true , validated: false },
                { id: "from_step_2_to_1", name: "Previous", visible: true , validated: false },
                { id: "from_step_2_to_3", name: "Next", visible: true , validated: false },
                { id: "from_step_3_to_2", name: "Previous", visible: true , validated: false },
                { id: "from_step_3_to_4", name: "Next", visible: true , validated: false },
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
                    site_region_id: {
                        label: "Site Region ID (Autofilled)",
                        name: "site_region_id",
                        required: true,
                        placeholder: "",
                        value: ''
                    },
                    site_country: {
                        label: "Site Country (Autofilled)",
                        name: "site_country",
                        required: true,
                        placeholder: "",
                        value: ''
                    },
                    temperature_comments: {
                        label: "Temperature Comments",
                        name: "temperature_comments",
                        required: true,
                        placeholder: "e.g Do not freeze",
                        value: ''
                    },
                    keep_between_temperature: {
                        label: "Keep Between (°C)",
                        name: "keep_between_temperature",
                        required: true,
                        placeholder: "",
                        value: ''
                    },
                    add_comment: {
                        label: "Add a Comment",
                        name: "add_comment",
                        required: true,
                        placeholder: "Add a comment....",
                        value: ''
                    }
                },
                documents:[
                    { name: "Document Name 1.pdf" , attached_by : "Novartis" , date: "03-06-2021, 00:00" , link : ""},
                    { name: "Document Name 2.pdf" , attached_by : "Novartis" , date: "03-06-2021, 00:25" , link : ""},
                ],
                comments:[
                    { content: "This is the comment that sponsor user wrote." , date: "03-06-2021, 01:00" }
                ]
            }
        };
        this.model.addExpression(
            "hasComments",
            () => {
                return this.model.form.comments.length >=1;
            },
            "form.comments.length"
        );


        setTimeout( () => {
            const readableContainer = this.element.querySelector('#target_cmo_id');

            readableContainer.addEventListener("change", (event)=>{this.onChange(event)});

        },1000);


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


        //STEP BUTTONS LOGIC

        //When you want to navigate from step 1 to step 2
        this.onTagEvent('from_step_1_to_2', 'click', (e) => {
            makeStepActive("wizard_form_step_2", "wizard_form_step_2_holder" , e);
        });

        //When you want to navigate from step 2 to step 1
        this.onTagEvent('from_step_2_to_1', 'click', (e) => {
            makeStepActive("wizard_form_step_1", "wizard_form_step_1_holder" , e);
        });

        //When you want to navigate from step 2 to step 3
        this.onTagEvent('from_step_2_to_3', 'click', (e) => {
            makeStepActive("wizard_form_step_3", "wizard_form_step_3_holder" , e);
        });

        //When you want to navigate from step 3 to step 2
        this.onTagEvent('from_step_3_to_2', 'click', (e) => {
            makeStepActive("wizard_form_step_2", "wizard_form_step_2_holder" , e);
        });

        //When you want to navigate from step 3 to step 2
        this.onTagEvent('from_step_3_to_4', 'click', (e) => {
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

     onChange(event){
        this.model.form.inputs.target_cmo_id.value = event.target.value;
    }



}
