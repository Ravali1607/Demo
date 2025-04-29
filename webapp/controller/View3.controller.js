sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageToast",
    "sap/m/Column"
], (Controller,JSONModel,Filter,FilterOperator,Sorter,MessageToast,Column) => {
    "use strict";
    var that;
    return Controller.extend("demo.controller.View3", {
        onInit() {
            that=this;
            var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
            oRouter.getRoute('View3').attachPatternMatched(that.plantMethod,that);
            that.onRead();
        },

        plantMethod: function(oEvent){
            var oData = oEvent.getParameter("arguments");
            var location = oData.plantLocation;
            var oLocation = new JSONModel({
                oLocation : location
            })
            that.getView().setModel(oLocation,"locationHeader");
            that.getOwnerComponent().getModel().read("/EMPLOYEE",{
                filters : [new Filter("EMP_BRANCH", FilterOperator.EQ, location)],
                success: function(oData){
                    var oFilteredModel = new JSONModel({
                        employee : oData.results
                    })
                    that.byId("branchTable").setModel(oFilteredModel);
                    var oTable = that.byId("branchTable");
                    var headers = oData.results[0];
                    var aColumns = Object.keys(headers);
                    var aColumns = [
                        { header: "Employee ID" },
                        { header: "Name" },
                        { header: "Blood Group" },
                        { header: "Designation" },
                        { header: "Email" },
                        { header: "Contact" },
                        { header: "Address" }
                    ];
                    aColumns.forEach(function(col) {
                        oTable.addColumn(new Column({
                            header: new sap.m.Label({ text: col.header})
                        }));
                    });
                    oTable.bindItems({
                        path: "/employee",
                        template: new sap.m.ColumnListItem({
                            cells: [
                                new sap.m.Text({ text: "{EMP_ID}" }),
                                new sap.m.Text({ text: "{EMP_NAME}" }),
                                new sap.m.Text({ text: "{EMP_BLODD_GRP}" }),
                                new sap.m.Text({ text: "{EMP_DESIG}" }),
                                new sap.m.Text({ text: "{EMP_EMAIL}" }),
                                new sap.m.Text({ text: "{EMP_CONT}" }),
                                new sap.m.Text({ text: "{EMP_ADDRESS}" })
                            ]
                        })
                    })
                }
            })
        },

        onAfterRendering: function(){
            that.onRead();
        },
        
        onRead: function(){
            that.getOwnerComponent().getModel().read("/EmployeeExperience",{
                success: function(oData){
                    var oEmpExpData = new JSONModel({
                        items : oData.results
                    })
                    that.getView().setModel(oEmpExpData,"oExpDataModel");
                }
            })
        },
        
        onBack: function(){
            that.byId("branchTable").destroyColumns();
            that.getOwnerComponent().getRouter().navTo("View2");
        },
        
        onSort: function(){
            var oTable = that.getView().byId("branchTable");
            var oBinding = oTable.getBinding("items");
            var bGroup = false;
            that.bDescending = !that.bDescending;
            var oSorter = [];
            oSorter.push(new sap.ui.model.Sorter("EMP_NAME",that.bDescending,bGroup))
            oBinding.sort(oSorter);
        },
        
        onTable: function(oEvent){
            if(!that.empExp){
                that.empExp = sap.ui.xmlfragment("demo.fragments.empInfo",that);
            }
            var oModel = that.getView().getModel("oExpDataModel");
            var oDetails = oModel.getProperty("/items");
            var oSelectedItem = that.getView().byId("branchTable").getSelectedItem();
            var oSelected = oSelectedItem.getBindingContext().getProperty("EMP_ID")
            var oFilter = oDetails.filter(function(id){
                return id.EmployeeID_EMP_ID === oSelected
            })
            var oFilteredModel = new sap.ui.model.json.JSONModel({
                items : oFilter
            })
            that.empExp.setModel(oFilteredModel,"ExpModel")
            that.empExp.open();
        },

        onEmpClose: function(){
            that.empExp.close();
        },

        onSearch: function(oEvent){
            var oValue = oEvent.getSource().getValue();
            var oSearch = [];
            oSearch.push(new Filter({
                path: "EMP_DESIG",
					operator: FilterOperator.Contains,
					value1: oValue,
					caseSensitive: false
                }))
            var oTable = that.getView().byId("branchTable");
            var oBinding = oTable.getBinding("items");
            oBinding.filter(oSearch);
        },

        onEdit: function(oEvent){
            var oTable = that.getView().byId("branchTable");
            var aSelectedItems = oTable.getSelectedItems();
            that.originalData = [];
            if(aSelectedItems == 0){
                    sap.m.MessageToast.show("Please select atleast one row to edit");
            }else{
                aSelectedItems.forEach(function(oItem) {
                    var originalData = oItem.getBindingContext().getObject();
                    that.originalData.push(originalData);
                    var oCells = oItem.getCells();
                    for (var i = 0; i < oCells.length; i++) {
                        var oText = oCells[i];
                        var sValue = oText.getText();
                        var oInput = new sap.m.Input({
                            value: sValue
                        });
                        oItem.removeCell(oText);
                        oItem.insertCell(oInput, i);
                    }
                }); 
                that.byId("saveButton").setVisible(true);
                that.byId("cancelButton").setVisible(true);
                that.byId("editButton").setVisible(false);
            }
        },

        onSave: function() {
            var oTable = that.getView().byId("branchTable");
            var aSelectedItems = oTable.getSelectedItems();
            var oModel = that.getOwnerComponent().getModel(); 
            
            aSelectedItems.forEach(function(oItem) {
                var oContext = oItem.getBindingContext().getObject(); 
                var oCells = oItem.getCells();
                var oUpdatedData = {};
                var aProperties = Object.keys(oContext);

                for (var i = 0; i < oCells.length; i++) {
                    if (i < aProperties.length) { 
                        var oInput = oCells[i];
                        var sProperty = aProperties[i];
                        oUpdatedData[sProperty] = oInput.getValue();
                        var oText = new sap.m.Text({
                            text: oUpdatedData[sProperty]
                        });
                        oItem.removeCell(oInput);
                        oItem.insertCell(oText, i);
                    }
                }
                var updatePath = `/EMPLOYEE('${oUpdatedData.EMP_ID}')`
                oModel.update(updatePath, oUpdatedData, {
                    success: function() {
                        sap.m.MessageToast.show("Data updated successfully");
                    },
                    error: function(oError) {
                        sap.m.MessageToast.show("Error updating data: " + oError.message);
                    }
                });
            });
            that.getView().byId("editButton").setVisible(true);
            that.getView().byId("saveButton").setVisible(false);
            that.getView().byId("cancelButton").setVisible(false);
            MessageToast.show("Changes saved successfully");
            
        },

        onCancel: function() {
            that.byId("saveButton").setVisible(false);
            that.byId("cancelButton").setVisible(false);
            that.byId("editButton").setVisible(true);
            var oTable = this.getView().byId("branchTable");
            var aSelectedItems = oTable.getSelectedItems();
            aSelectedItems.forEach(function(oItem, index) {
                var oCells = oItem.getCells();
                var originalValues = that.originalData[index]; 
                for (var i = 0; i < oCells.length; i++) {
                    var oInput = oCells[i];
                    var sValue = originalValues[Object.keys(originalValues)[i]]; 
                    var oText = new sap.m.Text({
                        text: sValue
                    });
                    oItem.removeCell(oInput);
                    oItem.insertCell(oText, i);
                }
            });
            that.originalData = [];
            sap.m.MessageToast.show("Changes discarded");
        }
    })
})
// <!----------------------    opening the fragment and displaying the details of that particular employee using press function in column list item      ------------------!>
// onTable: function(oEvent){
//     if(!that.empExp){
//         that.empExp = sap.ui.xmlfragment("demo.fragments.empInfo",that);
//     }
//     var oModel = that.getView().getModel("oExpDataModel");
//     var oDetails = oModel.getProperty("/items");
   
//     var oSelected = oEvent.getSource().getBindingContext().getObject();
//     var oFilter = oDetails.filter(function(id){
//         return id.EmployeeID_EMP_ID === oSelected
//     })
//     // sap.ui.getCore().byId("id").setText(oFilter[0].ID);
//     // sap.ui.getCore().byId("name").setText(oFilter[0].CompanyName);
//     // sap.ui.getCore().byId("role").setText(oFilter[0].Role);
//     // sap.ui.getCore().byId("startDate").setText(oFilter[0].StartDate);
//     // sap.ui.getCore().byId("endDate").setText(oFilter[0].EndDate);
//     // sap.ui.getCore().byId("res").setText(oFilter[0].Responsibilities);
//     var oFilteredModel = new sap.ui.model.json.JSONModel({
//         items : oFilter
//     })
//     that.empExp.setModel(oFilteredModel,"ExpModel")
//     that.empExp.open();
// },