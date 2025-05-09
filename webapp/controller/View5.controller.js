sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (Controller, JSONModel, Filter, FilterOperator) => {
    "use strict";
    var that;
    return Controller.extend("demo.controller.View5", {
        onInit() {
            that=this;
            that.oRouter = that.getOwnerComponent().getRouter();
            that.oRouter.getRoute("View5").attachPatternMatched(that.onRouteMatched, that);
        },
        
        onRouteMatched: function(oEvent) {
            var oEmployee = oEvent.getParameter("arguments");
            var sEmpId = oEmployee.emp;
            var sEmpLoc = oEmployee.loc;
            that.loadEmployeeData(sEmpId);
            that.loadRelatedData(sEmpLoc);
        },
        
        loadEmployeeData: function(sEmpId) {
            that.getOwnerComponent().getModel().read("/EMPLOYEE", {
                filters: [new Filter("EMP_ID", FilterOperator.EQ, sEmpId)],
                success: function(oData) {
                    var oModel = new JSONModel({
                        details: oData.results
                    });
                    that.getView().setModel(oModel);
                }.bind(that),
                error: function(oError) {
                    sap.m.MessageBox.error("Failed to load employee data");
                }
            });
            that.getOwnerComponent().getModel().read("/EmployeeExperience", {
                filters: [new Filter("EmployeeID_EMP_ID", FilterOperator.EQ, sEmpId)],
                success: function(oData) {
                    // var oModel1 = new JSONModel({
                    //     experience : oData.results
                    // });
                    // that.getView().setModel(oModel1,"empExpModel")
                    var oModel = that.getView().getModel() || new JSONModel();
                    oModel.setProperty("/employeeExperience", oData.results);
                    that.getView().setModel(oModel);
                }.bind(that)
            });
        },
        
        loadRelatedData: function(sEmpLoc) {
            that.getOwnerComponent().getModel().read("/PLANTS", {
                filters: [new Filter("PLANT_LOC", FilterOperator.EQ, sEmpLoc)],
                success: function(oData) {
                    var oModel = that.getView().getModel() || new JSONModel();
                    oModel.setProperty("/plantModel", oData.results);
                    that.getView().setModel(oModel);
                }.bind(that)
            });
        },
        
        onNavBack: function() {
            that.oRouter.navTo("View4");
        },

    });
});
