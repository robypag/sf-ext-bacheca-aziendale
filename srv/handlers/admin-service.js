const cds = require("@sap/cds");

class AdminService extends cds.ApplicationService {
    async init() {
        super.init();
        this.before("READ", "Areas", async (req) => {
            console.info(req.user);
        });

        this.before(["CREATE"], "Pubblications", async (req) => {});

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
