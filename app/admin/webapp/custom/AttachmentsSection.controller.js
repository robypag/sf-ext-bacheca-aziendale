/* eslint-disable no-undef */
sap.ui.define(
    ["sap/ui/core/mvc/Controller", "sap/m/MessageToast"],
    (Controller, MessageToast) => {
        "use strict";
        return Controller.extend(
            "itg.sf.bachecaadmin.custom.AttachmentsSection",
            {
                handleUploadPress() {
                    MessageToast.show("Reached");
                },
            }
        );
    }
);
