sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/Column",
    "sap/viz/ui5/data/FlattenedDataset",
    "sap/viz/ui5/controls/common/feeds/FeedItem",
], (Controller,JSONModel,Filter,FilterOperator,Column,FlattenedDataset,FeedItem) => {
    "use strict";
    var that;
    return Controller.extend("demo.controller.VIew2", {
        onInit() {
            that=this;
            var oFlag = true;
            // if(oFlag){
            //     that.getOwnerComponent().getRouter().navTo("View1");
            // }
            var oModel = that.getOwnerComponent().getModel();
            oModel.read("/Sales",{
                success: function(Plant){
                    var uniquePlant = [];
                    Plant.results.forEach(function(p){
                        var planeName = p.PLANT_NAME;
                        if (uniquePlant.indexOf(planeName) === -1) {
                            uniquePlant.push(planeName);
                        }
                    })
                    var unique= new JSONModel({
                        aPlant: uniquePlant,
                    });
                    that.getView().setModel(unique, "Plants");
                }
            })
        },
        onAfterRendering: function(){
            that.getOwnerComponent().getModel().read("/PLANTS",{
                success: function(oData){
                    var oModel = new JSONModel({
                        items : oData
                    })
                    that.getView().setModel(oModel,"plantModel");
                }
            })
        },
        
        onBack: function(){
            that.getOwnerComponent().getRouter().navTo("View1");
        },
        onPlantDetail: function(oEvent){
            var oModel = that.getView().getModel("plantModel");
            var value = oEvent.getParameter("listItem");
            var oSelectedPlant = value.getBindingContext().getObject();
            var location = oSelectedPlant.PLANT_LOC;
            that.getOwnerComponent().getRouter().navTo("View3",{
                plantLocation : location
            })
        },
        onSalesPlant: function(){
            that.byId("addButton").setVisible(true);
            var selectedPlant = that.byId("plantData").getSelectedKey();
            if(selectedPlant){
                var oFilter = new Filter("PLANT_NAME", FilterOperator.EQ, selectedPlant);
                that.getOwnerComponent().getModel().read("/Sales",{
                    filters : [oFilter],
                    success: function(oData){
                        var oSalesModel = new JSONModel({
                            sales : oData.results
                        })
                        that.byId("salesData").setModel(oSalesModel);
                        var oTable = that.byId("salesData");
                        oTable.bindItems({
                            path: "/sales",
                            template: new sap.m.ColumnListItem({
                                cells: [
                                    new sap.m.Text({ text: "{ID}" }),
                                    new sap.m.Text({ text: "{ItemName}" }),
                                    new sap.m.Text({ text: "{QUAN}" }),
                                    new sap.m.Text({ text: "{REVENUE}" }), 
                                    new sap.m.Text({ text: "{EXPECTED}" }),
                                    new sap.m.Text({ text: "{DURATION}" }),
                                    new sap.m.Text({ text: "{LEVEL}" })
                                ]
                            })
                        })
                        var oModel = new JSONModel({
                            salesData : oData.results
                        })
                        that.byId("salesGraph").setModel(oModel);
                        var oVizFrame = that.byId("revenueChart");
                        // oVizFrame.setModel(oModel);
                        oVizFrame.setVizProperties({
                            plotArea: {
                                dataLabel: {
                                    visible: true
                                }
                            },
                            title: {
                                text: "Actual vs Expected Revenue for " + selectedPlant
                            },
                            valueAxis: {
                                title: {
                                    text: "Amount"
                                }
                            },
                            categoryAxis: {
                                title: {
                                    text: "Items"
                                }
                            },
                        });            
                    }
                })
            }
        },
        onSales: function(){
            if(!that.sales){
                that.sales = sap.ui.xmlfragment("demo.fragments.customer", that);
            }
            var oSelectedPlant = that.byId("plantData").getValue();
            sap.ui.getCore().byId("s_plant").setValue(oSelectedPlant),
            that.sales.open();
        },
        onCreateSales: function(){
            // let oCustomer = {
            //     Name :sap.ui.getCore().byId("c_name").getValue(),
            //     Email :sap.ui.getCore().byId("c_email").getValue(),
            //     CONTACT :sap.ui.getCore().byId("c_cont").getValue(),
            //     PurchasedTillNow :sap.ui.getCore().byId("c_ptn").getValue(),
            //     Branch: sap.ui.getCore().byId("c_branch").getValue(),
            // }
            // var oModel = that.getOwnerComponent().getModel();
            // oModel.create("/Customers",oCustomer,{
            //     success:function(response){
            //         sap.m.MessageToast.show("Customer Details added successfully");
            //     },error:function(error){
            //         sap.m.MessageToast.show("Error while adding Plant");
            //         console.log(error);
            //     }
            // })
            
            let oSales = {
                ID :sap.ui.getCore().byId("s_id").getValue(),
                PLANT_NAME : sap.ui.getCore().byId("s_plant").getValue(),
                ItemName :sap.ui.getCore().byId("s_item").getValue(),
                QUAN :sap.ui.getCore().byId("s_qua").getValue(),
                REVENUE: sap.ui.getCore().byId("s_rev").getValue(),
                LEVEL: sap.ui.getCore().byId("s_level").getValue(),
                EXPECTED: sap.ui.getCore().byId("s_exp").getValue(),
                DURATION: sap.ui.getCore().byId("s_dur").getValue()
            }
            var oModel = that.getOwnerComponent().getModel();
            oModel.create("/Sales",oSales,{
                success:function(response){
                    sap.m.MessageToast.show("Sales Details added successfully");
                },error:function(error){
                    sap.m.MessageToast.show("Error while adding Plant");
                    console.log(error);
                }
            })
            that.onSalesPlant();
            that.sales.close();
            that.reset();
        },
        reset: function(){
            sap.ui.getCore().byId("s_id").setValue("");
            sap.ui.getCore().byId("s_plant").setValue("");
            sap.ui.getCore().byId("s_item").setValue("");
            sap.ui.getCore().byId("s_qua").setValue("");
            sap.ui.getCore().byId("s_rev").setValue("");
            sap.ui.getCore().byId("s_level").setValue("");
            sap.ui.getCore().byId("s_exp").setValue("");
            sap.ui.getCore().byId("s_dur").setValue("");
        },
        onCancelSales: function(){
            that.sales.close();
        }
    })
})