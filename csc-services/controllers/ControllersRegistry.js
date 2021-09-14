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

        if(!controller){
            throw new Error(`Controller ${controllerName} was not found. Did you registered it?`);
        }

        return class extends controller{
            constructor(...props) {
                const constructorParams = role ? [role, ...props] : [...props];
                super(...constructorParams);
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