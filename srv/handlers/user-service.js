const cds = require("@sap/cds");
const moment = require("moment");

class PubblicationService extends cds.ApplicationService {
  async init() {
    // Initialize Superclass to activate generic handlers
    super.init();
    // Reject all HTTP verbs beside READ
    this.reject(["CREATE", "UPDATE", "DELETE"], ["SFUserInfo", "SFLocationInfo", "SFJobInfo"]);

    /*
    this.after("READ", "Pubblications", async (result, req) => {
      // Lettura Location da SF:
      const EmploymentInfoService = await cds.connect.to("ECEmploymentInformation");
      const { SFJobInfo } = EmploymentInfoService.entities;
      try {
        const currentDate = moment().format("YYYY-MM-DD");
        const jobInfoData = await EmploymentInfoService.get(
          `/EmpJob?$filter=userId eq '${req.user.id}' and (startDate le '${currentDate}' and endDate ge '${currentDate}')`
        );
        // Sort Data
        let currentJobInfo;
        if (jobInfoData.length > 1) {
          currentJobInfo = jobInfoData.sort((a, b) =>
            moment(a.startDate).isBefore(moment(b.startDate)) ? -1 : moment(a.startDate).isAfter(b.startDate) ? 1 : 0
          )[0];
        } else {
          currentJobInfo = jobInfoData[0];
        }
        // Location Servizio / Location Ruolo
        const locationServizio = currentJobInfo.location;
        const locationRuolo    = currentJobInfo.customString17;
        // Ricerca Foundation Object
        const FoundationObjectService = await cds.connect.to('ECFoundationOrganization');
        const { SFLocationInfo } = FoundationObjectService.entities;
        try {
          const locationQuery = SELECT.from(SFLocationInfo).where(`externalCode = ${locationServizio}`);
          const locationData  = FoundationObjectService.tx(req).run(locationQuery);
          // --- locationData.rsu = 9;
          result.filter( (r) => (r.area_id === locationData.rsu || r.area_id === 20) );

        } catch (oError) {

        }
      } catch (oError) {
        console.error(oError);
      }
    });
    */

    this.after("READ", "Attachments", async (each) => {
      if (Array.isArray(each)) {
        each.forEach((e) => {
          e.attachmentUrl = `v2/browse/Attachments(ID=${e.ID})/$value`;
        });
      } else {
        // Might be null, if we are requiring the media value of this entity
        if (each !== null) {
          each.attachmentUrl = `v2/browse/Attachments(ID=${each.ID})/$value`;
        }
      }
    });
    // Read UserInfo from SF
    this.on("READ", "SFUserInfo", async (req) => {
      try {
        const UserInfoService = cds.connect.to("PLTUserManagement");
        const { SFUser } = UserInfoService.entities;
        const userQuery = SELECT.from(SFUser).where(`userId = '${req.user.id}'`);
      } catch (oDataError) {
        req.error(`Connection to SuccessFactors failed! Data for User ${req.user} cannot be retrieved`);
      }
    });
    // Read JobInfo
    this.on("READ", "SFJobInfo", async (req) => {
      try {
        const EmploymentInfoService = await cds.connect.to("ECEmploymentInformation");
        const { SFJobInfo } = EmploymentInfoService.entities;
        const jobInfoQuery = SELECT.from(SFJobInfo).where(`userId = '${req.user.id}'`);
        return EmploymentInfoService.tx(req).run(jobInfoQuery);
      } catch (oDataError) {
        console.error(oDataError);
        req.error(`Connection to SuccessFactors failed! Data for User ${req.user} cannot be retrieved`);
      }
    });
  }
}

module.exports = { PubblicationService };
