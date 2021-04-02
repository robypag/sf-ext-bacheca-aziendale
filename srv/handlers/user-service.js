const cds = require("@sap/cds");
const moment = require("moment");

class PubblicationService extends cds.ApplicationService {
  async init() {
    // ON handlers must go before the initalization

    /**
     * In AFTER handler, only synchronous modifications can be applied.
     * In our case, we need to asynchronously access a remote service, therefore
     * we cannot use an AFTER handler.
     * Use the "ON" handler, wait for the standard cap handler to calculate the result (await next())
     * then filter out
     * See https://cap.cloud.sap/docs/node.js/services#event-handlers
     */
     this.on("READ", "Pubblications", async (req, next) => {
      const result = await next();
      // Filter the result accordingly to RSU area:
      const rsuFilter = await this._filterByRsu(req);
      return result.filter((r) => r.area.id === parseInt(rsuFilter) || r.area.id === 20);
    });

    // Initialize Superclass to activate generic handlers
    super.init();
    // Reject all HTTP verbs beside READ
    this.reject(["CREATE", "UPDATE", "DELETE"], ["SFUserInfo", "SFLocationInfo", "SFJobInfo"]);

    this.after("READ", "Pubblications", async (each) => {
      if (Array.isArray(each)) {
        return each.map((e) => {
         if (e.type !== undefined)
         { 
         if (e.type.code === "2") {
           e.iconUrl = "sap-icon://marketing-campaign";
         } else {
           e.iconUrl = "sap-icon://decision";
         }
        }});
       } else {
        if (each.type !== undefined){
         if (each.type.code === "2") {
           each.iconUrl = "sap-icon://marketing-campaign";
         } else {
           each.iconUrl = "sap-icon://decision";
         }
        }
        return each;
       }
    });

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
  
  async _filterByRsu(req) {
    // Lettura Location da SF:
    const EmploymentInfoService = await cds.connect.to("ECEmploymentInformation");
    try {
      const currentDate = moment().format("YYYY-MM-DD");
      const jobInfoData = await EmploymentInfoService.get(
        `/EmpJob?$filter=userId eq '${req.user.id}' and (startDate le '${currentDate}' and endDate ge '${currentDate}')&$orderBy=startDate desc,seqNumber desc`
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
      // const locationServizio = currentJobInfo.location;
      // const locationRuolo = currentJobInfo.customString17;
      return currentJobInfo.customString24;
    } catch (oError) {
      console.error(oError);
    }
  }
}

module.exports = { PubblicationService };
