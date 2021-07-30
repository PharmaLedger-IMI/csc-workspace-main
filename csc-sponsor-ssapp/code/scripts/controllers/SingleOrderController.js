const cscServices = require("csc-services");
const actor = cscServices.constants.Roles.Sponsor;
const Controller = cscServices.getController("SingleOrderController",actor);
export default Controller;

