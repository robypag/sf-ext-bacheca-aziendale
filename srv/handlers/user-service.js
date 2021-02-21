const cds = require("@sap/cds");

class PubblicationService extends cds.ApplicationService {
    async init() {
        // Reject all HTTP verbs beside READ
        this.reject(
            ["CREATE", "UPDATE", "DELETE"],
            ["SFUserInfo", "SFLocationInfo", "SFJobInfo"]
        );
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
                req.error(
                    `Connection to SuccessFactors failed! Data for User ${req.user} cannot be retrieved`
                );
            }
        });
    }
}

module.exports = { PubblicationService };
