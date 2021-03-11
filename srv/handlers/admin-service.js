const cds = require("@sap/cds");

class AdminService extends cds.ApplicationService {
    async init() {
        super.init();

        this.before("SAVE", "Pubblications", async(req) => {
            const pubblicationEntry = req.data;
            console.info(req.target);
            if (pubblicationEntry.area_id === null) {
                req.error({
                    code: 'MISSING_MANDATORY_FIELDS',
                    args: ['Area RSU'],
                    status: 400
                });
            }
            if (pubblicationEntry.type_code === null) {
                req.error({
                    code: 'MISSING_MANDATORY_FIELDS',
                    args: ['Tipologia'],
                    status: 400
                });
            }
            if (pubblicationEntry.originalDate === null) {
                req.error({
                    code: 'MISSING_MANDATORY_FIELDS',
                    args: ['Data Accordo'],
                    status: 400
                });
            }            
        });

        this.after("READ", "Attachments", async (each) => {
            if (Array.isArray(each)) {
                each.forEach((e) => {
                    e.attachmentUrl = `/admin/Attachments(ID=${e.ID},IsActiveEntity=${e.IsActiveEntity})/value`;
                });
            } else {
                // Might be null, if we are requiring the media value of this entity
                if (each !== null) {
                    each.attachmentUrl = `/admin/Attachments(ID=${each.ID},IsActiveEntity=${each.IsActiveEntity})/value`;
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
                        .columns([
                            "todoEntryName",
                            "categoryId",
                            "status",
                            "subjectId",
                            "linkUrl",
                            "userNav",
                        ])
                        .entries([todoEntry]);
                    const result = await TodoService.tx(req).run(postQuery);
                    console.log(result);
                } catch (oDataError) {
                    console.log(oDataError);
                    req.warn(
                        `Notification to users could not be sent at the moment`
                    );
                }
            }
        });
    }
}

module.exports = { AdminService };
