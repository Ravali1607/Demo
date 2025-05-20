sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (Controller, JSONModel, Filter, FilterOperator) => {
    "use strict";
    var that;
    return Controller.extend("demo.controller.View6", {
        onInit() {
            that=this;
            that.oRouter = that.getOwnerComponent().getRouter();
        },
             
        onNavBack: function() {
            that.oRouter.navTo("View1");
        }
    });
});
