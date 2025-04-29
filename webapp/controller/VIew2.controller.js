sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (Controller,JSONModel,Filter,FilterOperator) => {
    "use strict";
    var that;
    return Controller.extend("demo.controller.VIew2", {
        onInit() {
            that=this;
            var oFlag = true;
            // if(oFlag){
            //     that.getOwnerComponent().getRouter().navTo("View1");
            // }
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
            
        }
    })
})