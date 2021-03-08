const cds = require("@sap/cds");

class PubblicationService extends cds.ApplicationService {
    async init() {
        // Initialize Superclass to activate generic handlers
        super.init();
        // Reject all HTTP verbs beside READ
        this.reject(
            ["CREATE", "UPDATE", "DELETE"],
            ["SFUserInfo", "SFLocationInfo", "SFJobInfo"]
        );
        this.after("READ", "Attachments", async (each) => {
            if (Array.isArray(each)) {
                each.forEach((e) => {
                    console.info(e);
                    e.attachmentUrl = `v2/browse/Attachments(ID=${e.ID})/$value`;
                });
            } else {
                // Might be null, if we are requiring the media value of this entity
                if (each !== null) {
                    console.info(each);
                    each.attachmentUrl = `v2/browse/Attachments(ID=${each.ID})/$value`;
                }
            }
        });
        // Read UserInfo from SF
        this.on("READ", "SFUserInfo", async (req) => {
            try {
                const UserInfoService = await cds.connect.to(
                    "PLTUserManagement"
                );
                const { SFUser } = UserInfoService.entities;
                const userQuery = SELECT.from(SFUser).where(
                    `userId = '${req.user.id}'`
                );
                return UserInfoService.tx(req).run(userQuery);
            } catch (oDataError) {
                req.error(
                    `Connection to SuccessFactors failed! Data for User ${req.user} cannot be retrieved`
                );
            }
        });
        // Read JobInfo
        this.on("READ", "SFJobInfo", async (req) => {
            try {
                const EmploymentInfoService = await cds.connect.to(
                    "ECEmploymentInformation"
                );
                const { SFJobInfo } = EmploymentInfoService.entities;
                const jobInfoQuery = SELECT.from(SFJobInfo).where(
                    `userId = '${req.user.id}'`
                );
                return EmploymentInfoService.tx(req).run(jobInfoQuery);
            } catch (oDataError) {
                console.error(oDataError);
                req.error(
                    `Connection to SuccessFactors failed! Data for User ${req.user} cannot be retrieved`
                );
            }
        });
    }
}

module.exports = { PubblicationService };
