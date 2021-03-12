/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
sap.ui.define(
    ["itg/sf/bachecaadmin/control/FileUploaderV4"],
    function (FileUpload) {
        "use strict";
        return {
            onHandleFileDelete: function (oContext, aSelectedContexts) {
                if (aSelectedContexts.length === 0) {
                    var sMessageText = this._controller.oResourceBundle.getText(
                        "deleteMessageSelectEntry"
                    );
                    new sap.m.MessageBox.show(sMessageText, {
                        icon: sap.m.MessageBox.Icon.ERROR,
                        title: "Errore",
                        actions: sap.m.MessageBox.Action.OK,
                    });
                } else {
                    aSelectedContexts.forEach((oSelectedContext) => {
                        oSelectedContext.delete();
                        var attachmentId = oSelectedContext.getObject().ID;
                        fetch(`admin/Attachments(ID=${attachmentId})`, {
                            method: "DELETE",
                        }).then((response) => {
                            if (!response.ok) {
                                sap.m.MessageToast.show(
                                    `${response.status}-${response.statusText}`
                                );
                            } else {
                                oSelectedContext.delete();
                                oSelectedContext.refresh();
                                sap.m.MessageToast.show(
                                    `Allegato ${attachmentId} cancellato correttamente`
                                );
                            }
                        });
                    });
                }
            },
            onHandleFileUpload: function (oContext, aSelectedContexts) {
                // An Info Message
                var oInfoMessage = new sap.m.MessageStrip({
                    showIcon: true,
                    text:
                        "Durante la creazione di una nuova Pubblicazione, assicurarsi di <strong>salvare</strong> l'inserimento <strong>prima</strong> di caricare un allegato",
                    enableFormattedText: true,
                    type: sap.ui.core.MessageType.Warning,
                });
                oInfoMessage.addStyleClass("sapUiSmallMargin");
                // The file Uploader:
                var oFileUpload = new FileUpload({
                    useMultipart: false,
                    uploadUrl: "admin/Attachments",
                    buttonOnly: true,
                    icon: "sap-icon://upload-to-cloud",
                    uploadComplete: function (oEvent) {
                        sap.m.MessageToast.show(`Upload Completed!`);
                        oDialog.close();
                    },
                });
                // The VBox:
                var oVBox = new sap.m.VBox({
                    //class: "sapUiResponsiveMargin sapUiResponsivePadding",
                    width: "100%",
                    alignItems: sap.m.FlexAlignItems.Center,
                    justifyContent: sap.m.FlexJustifyContent.Center,
                    items: [oInfoMessage, oFileUpload],
                });
                oVBox.addStyleClass("sapUiResponsivePadding");
                // The Dialog:
                var oDialog = new sap.m.Dialog({
                    title: "Upload Attachment",
                    type: sap.m.DialogType.Standard,
                    content: oVBox,
                    beginButton: new sap.m.Button({
                        text: "Upload",
                        press: function (oEvent) {
                            // Upload the new attachment:
                            const oUploadedFile =
                                oFileUpload.oFileUpload.files[0];
                            const oPayload = {
                                name: oUploadedFile.name,
                                mimeType: oUploadedFile.type || "text/plain",
                                pubblication_ID: oContext.getObject().ID,
                            };
                            fetch(`${oFileUpload.getUploadUrl()}`, {
                                method: "POST",
                                body: JSON.stringify(oPayload),
                                headers: {
                                    "Content-Type": "application/json",
                                },
                            })
                                .then((response) => {
                                    if (!response.ok) {
                                        throw new Error(
                                            `${response.status}-${response.statusText}`
                                        );
                                    } else {
                                        return response.json();
                                    }
                                })
                                .then((decodedResponse) => {
                                    oFileUpload.setUploadUrl(
                                        `${oFileUpload.getUploadUrl()}(ID=${
                                            decodedResponse.ID
                                        },IsActiveEntity=${
                                            decodedResponse.IsActiveEntity
                                        })/value`
                                    );
                                    oFileUpload.setSendXHR(true);
                                    oFileUpload.upload();
                                })
                                .catch((oError) => {
                                    sap.m.MessageToast.show(`Error: ${oError}`);
                                });
                        },
                    }),
                    endButton: new sap.m.Button({
                        text: "Cancel",
                        press: function (oEvent) {
                            oDialog.close();
                        },
                    }),
                    afterClose: function () {
                        oDialog.destroy();
                        oContext.refresh();
                    },
                });
                oDialog.open();
            },
        };
    }
);
