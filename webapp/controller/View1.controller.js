sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/Column",
    "sap/m/ColumnListItem",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/m/Bar"
], (Controller,Filter,FilterOperator,JSONModel,Column,ColumnListItem,MessageBox,Fragment,Sorter,Bar) => {
    "use strict";
    var that;
    return Controller.extend("demo.controller.View1", {
        onInit() {
            that = this;
            this.initRichTextEditor(false);
            that.getOwnerComponent().getModel().read("/EMPLOYEE", {
                success: function(data) {
                    var designationArray = data.results.reduce((des, emp) => {
                        var existing = des.find(item => item.name === emp.EMP_DESIG);
                        if (existing) {
                            existing.count++;
                        } else {
                            des.push({ name: emp.EMP_DESIG, count: 1 });
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

        onBeforeRendering: function(){
            that.getOwnerComponent().getModel().read("/EMPLOYEE",{
                success: function(oData){
                    var oModel = new JSONModel ({
                        empInfo : oData
                    });
                    that.getView().setModel(oModel, "EmpModel");
                }
            })
        },
        
        onDetail: function(oEvent){
            var oModel = that.getView().getModel("EmpModel");
            var value = oEvent.getParameter("listItem");
            var oSelectedItem = value.getBindingContext("Designations").getObject();
            var oDes = oSelectedItem.name;
            var aAllEmployees = oModel.getProperty("/empInfo")
            var aFilteredEmployees = aAllEmployees.results.filter(function(emp) {
                return emp.EMP_DESIG === oDes;
            });
            var oFilteredModel = new sap.ui.model.json.JSONModel({
                employees: aFilteredEmployees
            });
           
            if (!that.busyDialog) {
                that.busyDialog = new sap.m.BusyDialog({
                    text: "Loading... Please wait"
                });
            }
            that.busyDialog.open();
            setTimeout(function() {
                that.busyDialog.close();
                if(!that.detail){
                    that.detail = sap.ui.xmlfragment("demo.fragments.busy",that);
                }
                that.detail.setModel(oFilteredModel);
                var oDesignationModel = new sap.ui.model.json.JSONModel({
                    selectedDesignation: oDes
                });
                that.detail.setModel(oDesignationModel, "designationModel");
                that.detail.open();
            }, 2000);
        },

        onClose: function(){
            that.detail.close();
        },
        
        onSort: function (oEvent) {
            // var oItems = sap.ui.getCore().byId("nameList").getItems();
            // var oView = oEvent.getSource().getParent().getModel().getData();
            this.bDescending = !this.bDescending;
            var oList = sap.ui.getCore().byId("nameList");
            var oBinding = oList.getBinding("items");
            var bGroup = false;
            oBinding.sort(new Sorter("EMP_NAME", this.bDescending, bGroup));
        },
        
        
        onName: function(oEvent){
            if(!that.personal){
                that.personal = sap.ui.xmlfragment("demo.fragments.personal",that);
            }
            var oList = oEvent.getParameter("listItem");
            var oEmp = oList.getBindingContext().getObject();
            sap.ui.getCore().byId("empId").setText(oEmp.EMP_ID);
            sap.ui.getCore().byId("empName").setText(oEmp.EMP_NAME);
            sap.ui.getCore().byId("empBld").setText(oEmp.EMP_BLODD_GRP);
            sap.ui.getCore().byId("empDes").setText(oEmp.EMP_DESIG);
            sap.ui.getCore().byId("empEmail").setText(oEmp.EMP_EMAIL);
            sap.ui.getCore().byId("empCont").setText(oEmp.EMP_CONT);
            sap.ui.getCore().byId("empAdd").setText(oEmp.EMP_ADDRESS);
            sap.ui.getCore().byId("empBran").setText(oEmp.EMP_BRANCH);
            that.personal.open();
        },

        onEmpClose: function(){
            that.personal.close();
        },
        
        onPress: function(oEvent){
            // var oValue = "Ravali"
            var oResource = this.getOwnerComponent().getModel("i18n");
            var output = oResource.getResourceBundle().getText('value');
            sap.m.MessageToast.show(output);
        },

        onDemo : function(){
            if (!that.busyDialog) {
                that.busyDialog = new sap.m.BusyDialog({
                    text: "Loading... Please wait"
                });
            }
            that.busyDialog.open();
            setTimeout(function() {
                that.busyDialog.close();
                if (!that.inputFields) {
                    that.inputFields = sap.ui.xmlfragment("demo.fragments.open", that);
                }
                that.inputFields.open();
            }, 2000);
        },

        onField: function(oEvent){
            var field = oEvent.getSource();
            var fieldId = field.getId();
            var input = parseInt(field.getValue());
            var errorMessage = "";
            var sumMessage = "";

            var field1 = sap.ui.getCore().byId("field1");
            var field2 = sap.ui.getCore().byId("field2");
            var field3 = sap.ui.getCore().byId("field3");
            
            var input1 = parseInt(field1.getValue()) || 0;
            var input2 = parseInt(field2.getValue()) || 0;
            var input3 = parseInt(field3.getValue()) || 0;
            var sum = input1 + input2 + input3;

            if(!Number.isInteger(Number(input))||input<0||input>104) {
                errorMessage = "Value must be between 0 to 104";
            } else if (fieldId==="field2" && input % 4 !== 0) {
                errorMessage = "Value must be divisible by 4";
            } else if (fieldId==="field3" && input % 12 !== 0) {
                errorMessage = "Value must be divisible by 12";
            } else if (sum > 104) {
                sumMessage = "Sum must be less than or equal to 104";
            }

            // [field1, field2, field3].forEach(function(f) {
            //     f.setValueState(errorMessage ? "Error" : "None");
            //     f.setValueStateText(errorMessage || "");
            // });
            
            [field1, field2, field3].forEach(function(f) {
                var currentFieldId = f.getId();
                var isCurrentField = (currentFieldId === fieldId);
                
                if (sumMessage) {
                    f.setValueState("Error");
                    f.setValueStateText(sumMessage);
                } else if (isCurrentField && errorMessage) {
                    f.setValueState("Error");
                    f.setValueStateText(errorMessage);
                } else {
                    f.setValueState("None");
                    f.setValueStateText("");
                }
            });
        },

        onCancel: function(){
            that.inputFields.close();
        },
        
        onPlant: function(oEvent){
            if (!that.busyDialog) {
                that.busyDialog = new sap.m.BusyDialog({
                    text: "Loading... Please wait"
                });
            }
            that.busyDialog.open();
            setTimeout(function() {
                that.busyDialog.close();
            that.getOwnerComponent().getRouter().navTo("View2");
            },2000);
        },

        onEmpInfo: function(){
            if (!that.busyDialog) {
                that.busyDialog = new sap.m.BusyDialog({
                    text: "Loading... Please wait"
                });
            }
            that.busyDialog.open();
            setTimeout(function() {
                that.busyDialog.close();
            that.getOwnerComponent().getRouter().navTo("View4");
            }, 1000);
        },

        onSAC: function(){
            that.getOwnerComponent().getRouter().navTo("View6");
        },
        onValueHelpCancel: function() {
            that.valueHelpId.close();
        },
        
        onValueHelpRequested: function(oEvent) {
            if(!that.valueHelpId){
                that.valueHelpId = sap.ui.xmlfragment("demo.fragments.valueHelp", that);
            }
            // var oModel = that.getView().getModel("EmpModel");
            that.getOwnerComponent().getModel().read("/EMPLOYEE",{
                success: function(oData){
                    var oModel = new JSONModel({
                        items : oData.results
                    })
                    that.valueHelpId.setModel(oModel);
                }
            })
            that.valueHelpId.open();
        },

        onListId: function(oEvent) {
            var oSelected = oEvent.getParameter("listItem");
            this.handleEmployeeSelection(oSelected);
            this.valueHelpId.close();
        },
        
        onSuggestionItemSelected: function(oEvent) {
            var oSelected = oEvent.getParameter("selectedItem");
            this.handleEmployeeSelection(oSelected);
        },

        handleEmployeeSelection: function(selectedItem) {
            var oItem = selectedItem.getBindingContext().getObject();
            var oInput = this.getView().byId("valueHelpInput");
            oInput.setValue(oItem.EMP_ID);
            
            this.getOwnerComponent().getModel().read("/EmployeeExperience", {
                filters: [new Filter("EmployeeID_EMP_ID", FilterOperator.EQ, oItem.EMP_ID)],
                success: function(oData) {
                    var oModel = new JSONModel({
                        data: oData,
                        data1: oItem
                    });
                    this.getView().setModel(oModel, "valueHelpModel");
                }.bind(this)
            });
        },
        handleSelect: function (oEvent) {
			var sSelectedKey = oEvent.getParameters().selectedItem.getKey();
			if (this.oRichTextEditor) {
				this.oRichTextEditor.destroy();
			}
			switch (sSelectedKey) {
				case "TinyMCE5":
					this.initRichTextEditor(true);
					break;
				default:
					this.initRichTextEditor(false);
					break;
			}
		},
		initRichTextEditor: function (bIsTinyMCE5) {
			var that = this,
				sHtmlValue = ""
                that.editorContent = "";
			sap.ui.require(["sap/ui/richtexteditor/RichTextEditor", "sap/ui/richtexteditor/library"],
				function (RTE, library) {
					var EditorType = library.EditorType;
					that.oRichTextEditor = new RTE("myRTE", {
						editorType: bIsTinyMCE5 ? EditorType.TinyMCE5 : EditorType.TinyMCE6,
						width: "100%",
						height: "600px",
						customToolbar: true,
						showGroupFont: true,
						showGroupLink: true,
						showGroupInsert: true,
						value: sHtmlValue,
						ready: function () {
							bIsTinyMCE5 ? this.addButtonGroup("styleselect").addButtonGroup("table") : this.addButtonGroup("styles").addButtonGroup("table");
						},
                        change: function(){
                            that.editorContent = that.oRichTextEditor.getValue();
                        }
					});
				that.getView().byId("idVerticalLayout").addContent(that.oRichTextEditor);
			});
		}
    });
});

// <!-----------------  creating headers and bind rows in the controller for the table -------------------->
// var headers = oData.results[0];
// var aColumns = Object.keys(headers);
// console.log(aColumns);
// var aColumns = [
//     { header: "Employee ID" },
//     { header: "Name" },
//     { header: "Blood Group" },
//     { header: "Designation" },
//     { header: "Email" },
//     { header: "Contact" },
//     { header: "Address" },
//     { header: "Branch" }
// ];
// aColumns.forEach(function(col) {
//     oTable.addColumn(new Column({
//         header: new sap.m.Label({ text: col.header})
//     }));
// });
// oTable.bindItems({
//     path: "/items",
//     template: new sap.m.ColumnListItem({
//         cells: [
//             new sap.m.Text({ text: "{EMP_ID}" }),
//             new sap.m.Text({ text: "{EMP_NAME}" }),
//             new sap.m.Text({ text: "{EMP_BLODD_GRP}" }),
//             new sap.m.Text({ text: "{EMP_DESIG}" }),
//             new sap.m.Text({ text: "{EMP_EMAIL}" }),
//             new sap.m.Text({ text: "{EMP_CONT}" }),
//             new sap.m.Text({ text: "{EMP_ADDRESS}" }),
//             new sap.m.Text({ text: "{EMP_BRANCH}" })
//         ]
//     })
// }) 
// <!--------------------  check the input fields based on the criteria  and add those values by using a button  --------------------> 
// onField1: function () {
//     var field = sap.ui.getCore().byId("field1");
//     var input1 = field.getValue();
//     if (!Number.isInteger(Number(input1))|| input1 < 0 || input1 > 104) {
//         field.setValueState("Error");
//         field.setValueStateText("Value must be between 0 and 104.");
//         sap.ui.getCore().byId("onSave").setEnabled(false);
//     } else {
//         field.setValueState("None");
//         field.setValueStateText("");
//         sap.ui.getCore().byId("onSave").setEnabled(true);
//     }
// },

// onField2: function () {
//     var field = sap.ui.getCore().byId("field2");
//     var oValue = field.getValue();
//     if(!Number.isInteger(Number(oValue)) || oValue % 4 != 0 && (oValue < 0 || oValue > 104)){
//         field.setValueState("Error");
//         field.setValueStateText("Value must be divisible by 4 and value must be between 0-104");
//         sap.ui.getCore().byId("onSave").setEnabled(false);
//     }else if(oValue % 4 != 0){
//         field.setValueState("Error");
//         field.setValueStateText("Value must be divisible by 4");
//         sap.ui.getCore().byId("onSave").setEnabled(false);
//     }else if(oValue < 0 || oValue > 104){
//         field.setValueState("Error");
//         field.setValueStateText("Value must be between 0-104");
//         sap.ui.getCore().byId("onSave").setEnabled(false);
//     }else{
//         field.setValueState(sap.ui.core.ValueState.None);
//         field.setValueStateText("");
//         sap.ui.getCore().byId("onSave").setEnabled(true);
//     }
// },

// onField3: function () {
//     var field = sap.ui.getCore().byId("field3");
//     var oValue = field.getValue();
//     if(!Number.isInteger(Number(oValue))|| oValue % 12 != 0 && (oValue < 0 || oValue > 104)){
//         field.setValueState("Error");
//         field.setValueStateText("Value must be divisible by 12 and value must be between 0-104");
//         sap.ui.getCore().byId("onSave").setEnabled(false);
//     }else if(oValue % 12 != 0){
//         field.setValueState("Error");
//         field.setValueStateText("Value must be divisible by 12");
//         sap.ui.getCore().byId("onSave").setEnabled(false);
//     }else if(oValue < 0 || oValue > 104){
//         field.setValueState("Error");
//         field.setValueStateText("Value must be between 0-104");
//         sap.ui.getCore().byId("onSave").setEnabled(false);
//     }else{
//         field.setValueState("None");
//         field.setValueStateText("");
//         sap.ui.getCore().byId("onSave").setEnabled(true);
//     }
// },
// onSubmit: function(){
//     // sap.ui.getCore().byId("onSave").setEnabled(false);
//     var input1 = parseInt(sap.ui.getCore().byId("field1").getValue());
//     var input2 = parseInt(sap.ui.getCore().byId("field2").getValue());
//     var input3 = parseInt(sap.ui.getCore().byId("field3").getValue());
//     if(input1 && input2 && input3){
//         var sum = input1+input2+input3;
//         if(sum>104 || sum<0){
//             MessageBox.error("Sum of the values must be less than 104");
//             that.inputFields.open();
//         }else{
//             MessageBox.information(`Total Value = ${sum}`);
//             that.inputFields.close();
//             that.onReset();
//         }
//     }else{
//         MessageBox.warning("Enter all the input values");
//     }    
// },

// <!-----------------------------  filtering the data after the service call  --------------------->
// that.getOwnerComponent().getModel().read("/EMPLOYEE",{
//     success: function(oData){
//         var oTable = that.getView().byId("tableData");
//         var oFilter = oData.results.filter(designation => designation.EMP_DESIG === "Trainee");
//         console.log(oFilter);
//         var oModel = new JSONModel({
//             items : oFilter
//         });
//         oTable.setModel(oModel);
//     },error: function(){
//         sap.m.MessageToast.show("Error");
//     }
// })

// <!---------------- example for busy dialog in controller  ----------------------->
// onClick: function(oEvent){
//     sap.m.MessageToast.show("Button");
//     if(!that.busyIndicator){
//         that.busyIndicator = sap.ui.xmlfragment("demo.fragments.busy",that);
//     }
//     that.busyIndicator.open();
//     setTimeout(function(){
//         that.busyIndicator.close();
//     },3000);
// }, 

// <!------------------------- filtering the emp info based on designation ----------------------->
// onDetail: function(oEvent){
//     var oModel = that.getOwnerComponent().getModel();
//     var value = oEvent.getParameter("listItem");
//     var oSelectedItem = value.getBindingContext("Designations").getObject();
//     var oDes = oSelectedItem.name;
//     var oEmployeeModel = new sap.ui.model.json.JSONModel();
//     var oFilter = new Filter("EMP_DESIG",FilterOperator.EQ,oSelectedItem.name);
//     oModel.read("/EMPLOYEE",{
//         filters: [oFilter],
//         success: function(oData){
//             oEmployeeModel.setData({ employees: oData.results });
//         }
//     })
//     that.getView().setModel(oEmployeeModel);
//     var oDesignationModel = new sap.ui.model.json.JSONModel({
//         selectedDesignation: oDes
//     });
//     that.detail.setModel(oDesignationModel, "designationModel");        
//     that.detail.open();
// },

// <!-------------------- another method for input fields ----------------------------->
// var fieldId = oEvent.getSource().getId();
// var field = sap.ui.getCore().byId(fieldId);
//             var input = field.getValue();
//             var errorMessage = "";
//             if(!Number.isInteger(Number(input))||input<0||input>104){
//                 errorMessage = "Value must be between 0 to 104"
//             }else if(fieldId === "field2" && input%4!=0){
//                 errorMessage = "Value must be divisible by 4"
//             }else if(fieldId === "field3" && input%12!=0){
//                 errorMessage = "Value must be divisible by 12"
//             }

//             if (errorMessage) {
//                 field.setValueState("Error");
//                 field.setValueStateText(errorMessage);
//             } else {
//                 field.setValueState("None");
//                 field.setValueStateText("");
//             }

//             if(!errorMessage){
//                 var input1 = parseInt(sap.ui.getCore().byId("field1").getValue());
//                 var input2 = parseInt(sap.ui.getCore().byId("field2").getValue());
//                 var input3 = parseInt(sap.ui.getCore().byId("field3").getValue());
//                 var fields = ["field1", "field2", "field3"];
//                 var sum = input1+input2+input3;
//                 if(input1 && input2 && input3){
//                     if(sum >104){
//                         errorMessage = "Sum must be less than 104";
//                         fields.forEach(function(id){
//                             var f = sap.ui.getCore().byId(id);
//                             f.setValueState("Error");
//                             f.setValueStateText(errorMessage);
//                         })
//                     }else{
//                         fields.forEach(function(id){
//                             var f = sap.ui.getCore().byId(id)
//                             f.setValueState("None");
//                             f.setValueStateText("");
//                         })
//                     }
//                 }
//             }

// <! --------------------------  removing duplications in designation and counting the Num of emp in that particular designation  ------------->
// that.getOwnerComponent().getModel().read("/EMPLOYEE",{
//     success: function(data){
//         var designationArray = [];
//         data.results.forEach(function (emp) {
//             var found = false;
//             for (var i = 0; i < designationArray.length; i++) {
//                 if (designationArray[i].name === emp.EMP_DESIG) {
//                     designationArray[i].count++;
//                     found = true;
//                 }
//             }
//             if (!found) {
//                 designationArray.push({
//                     name: emp.EMP_DESIG,
//                     count: 1
//                 });
//             }
//         });

//         var designationModel = new JSONModel({
//             aDes: designationArray
//         });
//         that.getView().setModel(designationModel, "Designations");
//     }
// })
// onListId: function(oEvent){
//     var oSelected = oEvent.getParameter("listItem");
//     var oItem = oSelected.getBindingContext().getObject();
//     var oInput = this.getView().byId("valueHelpInput");
//     oInput.setValue(oItem.EMP_ID);
//     that.getOwnerComponent().getModel().read("/EmployeeExperience",{
//         filters : [new Filter("EmployeeID_EMP_ID",FilterOperator.EQ, oItem.EMP_ID)],
//         success: function(oData){
//             var oModel = new JSONModel({
//                 data : oData,
//                 data1 : oItem
//             })
//             that.getView().setModel(oModel,"valueHelpModel");
//         }
//     })
//     that.valueHelpId.close();
// },
// onSuggestionItemSelected: function(oEvent){
//     var oSelected = oEvent.getParameter("selectedItem");
//     var oItem = oSelected.getBindingContext().getObject();
//     var oInput = this.getView().byId("valueHelpInput");
//     oInput.setValue(oItem.EMP_ID);
//     that.getOwnerComponent().getModel().read("/EmployeeExperience",{
//         filters : [new Filter("EmployeeID_EMP_ID",FilterOperator.EQ, oItem.EMP_ID)],
//         success: function(oData){
//             var oModel = new JSONModel({
//                 data : oData,
//                 data1 : oItem
//             })
//             that.getView().setModel(oModel,"valueHelpModel");
//         }
//     })
// }