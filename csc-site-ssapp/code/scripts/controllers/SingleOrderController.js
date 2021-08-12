const cscServices = require("csc-services");
const actor = cscServices.constants.Roles.Site;
const Controller = cscServices.getController("SingleOrderController",actor);
export default Controller;
