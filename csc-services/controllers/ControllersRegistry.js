function ControllersRegistry(){
    this.controllersRegistry = {};
    this.controllersLoaded = false;

    this.registerController = function(controllerName, controllerClass){
        if(!controllerName || !controllerClass){
            throw new Error("registerController requires both controllerName and controllerClass");
        }
        this.controllersRegistry[controllerName] = controllerClass;
    }

    this.getControllerClass = function(controllerName, role){

        if(!this.controllersLoaded){
            require("./impl");
            this.controllersLoaded = true;
        }
        let controller = this.controllersRegistry[controllerName];

        return class extends controller{
            constructor(...props) {
                super(role, ...props);
            }
        }
    }
}

let instance;
module.exports = {
    getControllersRegistry: function() {
        if (!instance) {
            instance = new ControllersRegistry();
        }
        return instance;
    }
};