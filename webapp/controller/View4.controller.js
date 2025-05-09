sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    
], (Controller,JSONModel) => {
    "use strict";
    var that;
    return Controller.extend("demo.controller.View4", {
        onInit() {
            that=this;
            
        },
        onEmployeeName: function(oEvent){
            var oEmployeeDetails = oEvent.getSource().getBindingContext().getProperty("EMP_ID");
            var oEmployeeLocation = oEvent.getSource().getBindingContext().getProperty("EMP_BRANCH");
            if (!that.busyDialog) {
                that.busyDialog = new sap.m.BusyDialog({
                    text: "Loading... Please wait"
                });
            }
            that.busyDialog.open();
            setTimeout(function() {
                that.getOwnerComponent().getRouter().navTo("View5",{
                    emp : oEmployeeDetails,
                    loc : oEmployeeLocation
                })
                that.busyDialog.close();
            },1000);
        },
        onBack: function(){
            that.getOwnerComponent().getRouter().navTo("View1");
        }
    })
})