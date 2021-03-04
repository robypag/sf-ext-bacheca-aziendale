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
                        title: "Error",
                        actions: sap.m.MessageBox.Action.OK,
                    });
                } else {
                    aSelectedContexts.forEach((oSelectedContext) => {
                        oSelectedContext.delete();
                        var attachmentId = oSelectedContext.getObject().ID;
                        fetch(`/admin/Attachments(ID=${attachmentId})`, {
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
                                    `Attachment ${attachmentId} deleted`
                                );
                            }
                        });
                    });
                }
            },
            onHandleFileUpload: function (oContext, aSelectedContexts) {
                // The file Uploader:
                var oFileUpload = new FileUpload({
                    useMultipart: false,
                    uploadUrl: "/admin/Attachments",
                    uploadComplete: function (oEvent) {
                        sap.m.MessageToast.show(`Upload Completed!`);
                        oDialog.close();
                    },
                });
                // The VBox:
                var oVBox = new sap.m.VBox({
                    width: "100%",
                    alignItems: "Center",
                    justifyContent: "Center",
                    items: [oFileUpload],
                });
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
