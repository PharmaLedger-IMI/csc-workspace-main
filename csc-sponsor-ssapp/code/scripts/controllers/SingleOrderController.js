const { WebcController } = WebCardinal.controllers;

export default class SingleOrderController extends WebcController {

    constructor(...props) {

        super(...props);

        this.model = {
            accordion: {
                order_details : { name: "Order Details" , tag : "order_details_accordion" , id : "order_details_accordion" , isOpened: true },
                attached_documents : { name: "Attached Documents" , tag : "attached_documents_accordion", id : "attached_documents_accordion" , isOpened: false },
                order_comments : { name: "Order Comments" , tag : "order_comments_accordion" , id : "order_comments_accordion" , isOpened: false }
            },
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
                        min: {
                            label: "Min Temperature (°C)",
                            name: "keep_between_temperature_min",
                            required: true,
                            placeholder: "",
                            value: ''
                        },
                        max: {
                            label : "Max Temperature (°C)",
                            name: "keep_between_temperature_max",
                            required: true,
                            placeholder: "",
                            value: ''
                        }
                    },
                    add_comment: {
                        label: "Add a Comment",
                        name: "add_comment",
                        required: true,
                        placeholder: "Add a comment....",
                        value: ''
                    }
                },
                docs: {},
                attachment: {
                    label: 'Select files',

                    listFiles: true,
                    filesAppend: false,
                    files: [],
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



        //Init Check on Accordion Items
        if(this.model.accordion){
            let keys = Object.keys(this.model.accordion);
            if(keys){
                keys.forEach( (key) => {
                    if(this.model.accordion[key].isOpened){
                        this.openAccordionItem(this.model.accordion[key].id);
                    }
                })
            }
        }


        this.onTagEvent('order_details_accordion', 'click', (e) => {
            this.toggleAccordionItem("order_details_accordion");
        });

        this.onTagEvent('attached_documents_accordion', 'click', (e) => {
            this.toggleAccordionItem("attached_documents_accordion");
        });

        this.onTagEvent('order_comments_accordion', 'click', (e) => {
            this.toggleAccordionItem("order_comments_accordion");
        });



    }



    toggleAccordionItem( el ){
        const element = document.getElementById(el);

        const icon = document.getElementById(el +"_icon");
        element.classList.toggle('accordion-item-active');
        icon.classList.toggle('rotate-icon');

        const panel = element.nextElementSibling;

        if (panel.style.maxHeight === "1000px") {
            panel.style.maxHeight = "0px";
        } else {
            panel.style.maxHeight = "1000px";
        }

        this.closeAllExcept(el);

    }


    openAccordionItem( el ) {
        const element = document.getElementById(el);
        const icon = document.getElementById(el +"_icon");

        element.classList.add('accordion-item-active');
        icon.classList.add('rotate-icon');
        const panel = element.nextElementSibling;
        if (panel.style.maxHeight) {
            panel.style.maxHeight = "0px";
        } else {
            panel.style.maxHeight = "1000px";
        }
    }

    closeAccordionItem( el ) {
        const element = document.getElementById(el);
        const icon = document.getElementById(el +"_icon");

        element.classList.remove('accordion-item-active');
        icon.classList.remove('rotate-icon');
        const panel = element.nextElementSibling;
        if (panel.style.maxHeight === '1000px') {
            panel.style.maxHeight = "0px";
        } else {
            panel.style.maxHeight = "1000px";
        }
    }

    closeAllExcept(el){
        const element = document.getElementById(el);

        if(el === 'order_details_accordion'){
            this.closeAccordionItem('attached_documents_accordion');
            this.closeAccordionItem('order_comments_accordion');
        }

        if(el === 'attached_documents_accordion'){
            this.closeAccordionItem('order_details_accordion');
            this.closeAccordionItem('order_comments_accordion');
        }

        if(el === 'order_comments_accordion'){
            this.closeAccordionItem('attached_documents_accordion');
            this.closeAccordionItem('order_details_accordion');
        }

    }

    onShowHistoryClick(){
        console.log("Show History Clicked");
    }


}
