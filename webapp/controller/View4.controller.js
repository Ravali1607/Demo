sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (Controller,JSONModel,Filter,FilterOperator) => {
    "use strict";
    var that;
    return Controller.extend("demo.controller.View4", {
        onInit() {
            that=this;
            that.oBranchInput = that.byId("branchValueHelpDialog");
            that.oDesignationInput = that.byId("desValueHelpDialog");
            that.getOwnerComponent().getModel().read("/EMPLOYEE", {
                success: function(data) {
                    var designationArray = data.results.reduce((des, emp) => {
                        var existing = des.find(item => item.name === emp.EMP_DESIG);
                        var existing1 = des.find(item => item.branch === emp.EMP_BRANCH);
                        if (existing || existing1) {
                        } else {
                            des.push({ name: emp.EMP_DESIG, branch: emp.EMP_BRANCH });
                        }
                        return des;
                    },[]);
                    var designationModel = new JSONModel({
                        aDes: designationArray
                    });
                    that.getView().setModel(designationModel, "Designations");
                }
            });
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
            that.onClearFilters();
        },
        
        onBranchValueHelp: function(){
            if(!that.branchValueHelp){
                that.branchValueHelp = sap.ui.xmlfragment("demo.fragments.branchValueHelp",that);
            }
            var model = that.getView().getModel("Designations");
            that.branchValueHelp.setModel(model);
            that.branchValueHelp.open();           
        },

        onValueHelpCancel: function(){
            that.branchValueHelp.close();
        },

        onBranchItem:function(oEvent){
            var oItem = oEvent.getParameter("listItem");
            that.sSelectedBranch = oItem.getTitle();
        },

        onBranchConfirm: function() {
            that.sBranchFilter = that.sSelectedBranch;
            that.oBranchInput.setValue(that.sSelectedBranch);
            that.branchValueHelp.close();
            that.applyFilters();
        },

        onDesignationConfirm: function() {
            that.sDesignationFilter = that.sSelectedBranch;
            that.oDesignationInput.setValue(that.sSelectedBranch);
            that.desginationValueHelp.close();
            that.applyFilters();
        },

        onValueHelpCancel: function(oEvent) {
            var sDialogId = oEvent.getSource().getParent().getParent().getId();
            if (sDialogId === "branchValueHelp") {
                that.branchValueHelp.close();
            } else {
                that.desginationValueHelp.close();
            }
        },

        applyFilters: function() {
            var oTable = that.byId("employeeTable");
            var aFilters = [];
            if (that.sBranchFilter) {
                aFilters.push(new Filter("EMP_BRANCH", FilterOperator.EQ, that.sBranchFilter));
            }
            if (that.sDesignationFilter) {
                aFilters.push(new Filter("EMP_DESIG", FilterOperator.EQ, that.sDesignationFilter));
            }
            if (aFilters.length > 0) {
                var oFilter = new sap.ui.model.Filter({
                    filters: aFilters,
                    and: true
                });
                oTable.getBinding("items").filter(oFilter);
            } else {
                oTable.getBinding("items").filter([]);
            }
        },

        onClearFilters: function() {
            that.sBranchFilter = "";
            that.sDesignationFilter = "";
            that.oBranchInput.setValue("");
            that.oDesignationInput.setValue("");
            that.applyFilters();
        },

        onDesginationValueHelp: function(){
            if(!that.desginationValueHelp){
                that.desginationValueHelp = sap.ui.xmlfragment("demo.fragments.designationValueHelp", that);
            }
            var oModel = that.getView().getModel("Designations")
            that.desginationValueHelp.setModel(oModel);
            that.desginationValueHelp.open();
        },

        // onValueHelpCancel: function(){
        //     that.desginationValueHelp.close();
        // },
    })
})
// var oFilter = [];
// var oSelectedItem = oEvent.getParameter("listItem");
// var selectedObject = oSelectedItem.getBindingContext().getObject();
// if(selectedObject){
//     oFilter.push(new Filter("EMP_DESIG", FilterOperator.EQ, selectedObject.name));
// }
// var oTable = that.byId("employeeTable");
// var oBinding = oTable.getBinding("items");
// oBinding.filter(oFilter);
// that.branchValueHelp.close();