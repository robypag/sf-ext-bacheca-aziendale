const cds = require("@sap/cds");

class AdminService extends cds.ApplicationService {
  async getUserName(transaction, query, resultField, data) {
    const userData = await transaction.run(query);
    if (userData !== undefined) {
      data[resultField] = userData.defaultFullName;
    }
    return data;
  }

  async init() {
    super.init();

    this.before("SAVE", "Pubblications", async (req) => {
      const pubblicationEntry = req.data;
      if (pubblicationEntry.title === null) {
        req.error({
          message: "Il campo Titolo è obbligatorio",
          // args: ['Titolo'],
          status: 400,
        });
      }
      if (pubblicationEntry.description === null || pubblicationEntry.description === "") {
        req.warn({
          message: "Non è stata inserita alcuna descrizione",
          // args: ['Descrizione'],
          status: 400,
        });
      }
      if (pubblicationEntry.area_id === null) {
        req.error({
          message: "Il campo Area RSU è obbligatorio",
          // args: ['Area RSU'],
          status: 400,
        });
      }
      if (pubblicationEntry.type_code === null) {
        req.error({
          message: "Il campo Tipologia è obbligatorio",
          // args: ['Tipologia'],
          status: 400,
        });
      }
      if (pubblicationEntry.originalDate === null) {
        req.error({
          message: "Il campo Data è obbligatorio",
          // args: ['Data Accordo'],
          status: 400,
        });
      }
    });

    this.before(["SAVE", "EDIT", "CREATE"], async (req) => {
      // Enhance Pubblication Entity with the name of the creating/modifiying user
      const entity = req.data;
      try {
        const UserInfoService = await cds.connect.to("PLTUserManagement");
        const { SFUser } = UserInfoService.entities;
        // Create the user query:
        const userQuery = SELECT.from(SFUser, { userId: req.user.id });
        // Ask data from SuccessFactors
        const userData = await UserInfoService.tx(req).run(userQuery);
        if (userData !== undefined) {
          switch (req.event) {
            case "CREATE":
              entity.createdByUsername = userData.defaultFullName;
              entity.modifiedByUsername = userData.defaultFullName;
              break;
            case "UPDATE":
              entity.modifiedByUsername = userData.defaultFullName;
              break;
            default:
              break;
          }
        }
        req.data = entity;
      } catch (oError) {
        entity.createdByUsername = "Anonymous";
        entity.modifiedByUsername = "Anonymous";
        req.data = entity;
      }
    });

    this.after("READ", "Pubblications", async (each, req) => {
      const UserInfoService = await cds.connect.to("PLTUserManagement");
      const { SFUser } = UserInfoService.entities;
      return Promise.all(
        each.map(async (e) => {
          // Fill in create/modify user is initial (first creation):
          try {
            if (e.createdByUsername === null || e.modifiedByUsername === null) {
              const userQuery = SELECT.from(SFUser, { userId: req.user.id });
              const userData = await UserInfoService.tx(req).run(userQuery);
              if (userData !== undefined) {
                e.createdByUsername = e.createdByUsername === null ? userData.defaultFullName : e.createdByUsername;
                e.modifiedByUsername = e.modifiedByUsername === null ? userData.defaultFullName : e.modifiedByUsername;
              }
            }
            return e;
          } catch (oError) {
            console.error("Error fetching data from SuccessFactors, defaulting to Anonymous user");
            e.createdByUsername = "Anonymous";
            e.modifiedByUsername = "Anonymous";
            return e;
          }
        })
      );
      /*
      const promises = [];
      const UserInfoService = await cds.connect.to("PLTUserManagement");
      const { SFUser } = UserInfoService.entities;
      if (Array.isArray(result)) {
        result.map((r) => {
          // Se NON Bozza -> si recuperano i valori di creatoDa/modificatoDa
          if (r.IsActiveEntity === true && r.HasActiveEntity === false) {
            const queryModifiedBy = SELECT.from(SFUser, { userId: r.modifiedBy });
            const queryCreatedBy = SELECT.from(SFUser, { userId: r.createdBy });
            promises.push(
              this.getUserName(UserInfoService.tx(req), queryModifiedBy, "modifiedBy", r),
              this.getUserName(UserInfoService.tx(req), queryCreatedBy, "createdBy", r)
            );
          } else {
            // Se Bozza -> non esistono i campi amministrativi, quindi si recupera autore ultima modifica bozza
            const queryCreatedBy = SELECT.from(SFUser, { userId: r.DraftAdministrativeData.LastChangedByUser });
            promises.push(this.getUserName(UserInfoService.tx(req), queryCreatedBy, "createdBy", r));
          }
        });
        const resultWithNames = await Promise.all(promises);
        return resultWithNames.map((r) => {
          if (r.modifiedBy === undefined) {
            r.modifiedBy = r.createdBy;
            r.modifiedAt = r.createdAt;
          }
          return r;
        });
      } else {
        const queryModifiedBy = SELECT.from(SFUser, { userId: result.modifiedBy });
        const queryCreatedBy = SELECT.from(SFUser, { userId: result.createdBy });
        promises.push(
          this.getUserName(UserInfoService.tx(req), queryModifiedBy, "modifiedBy", result),
          this.getUserName(UserInfoService.tx(req), queryCreatedBy, "createdBy", result)
        );
        await Promise.all(promises);
        return result;
      }
      */
    });

    this.after("READ", "Attachments", async (each) => {
      if (Array.isArray(each)) {
        each.forEach((e) => {
          e.attachmentUrl = `admin/Attachments(ID=${e.ID},IsActiveEntity=${e.IsActiveEntity})/value`;
        });
      } else {
        // Might be null, if we are requiring the media value of this entity
        if (each !== null) {
          each.attachmentUrl = `admin/Attachments(ID=${each.ID},IsActiveEntity=${each.IsActiveEntity})/value`;
        }
      }
    });

    this.after(["CREATE"], "Pubblications", async (entity, req) => {
      if (entity.notifyUsers) {
        // Wrap this in a new method
        const TodoService = await cds.connect.to("PLTTodo");
        const { SFTodoList } = TodoService.entities;
        try {
          // * Must be formatted as expected by SuccessFactors
          const todoEntry = {
            todoEntryName: entity.description,
            categoryId: "41",
            status: "2",
            subjectId: "Adminpagni",
            linkUrl: "http://www.google.com",
            userNav: {
              __metadata: {
                uri: `https://api2.successfactors.eu/odata/v2/User('Adminpagni')`,
                type: "SFOData.User",
              },
            },
          };
          const postQuery = INSERT.into(SFTodoList)
            .columns(["todoEntryName", "categoryId", "status", "subjectId", "linkUrl", "userNav"])
            .entries([todoEntry]);
          const result = await TodoService.tx(req).run(postQuery);
          console.log(result);
        } catch (oDataError) {
          console.log(oDataError);
          req.warn(`Notification to users could not be sent at the moment`);
        }
      }
    });
  }
}

module.exports = { AdminService };
