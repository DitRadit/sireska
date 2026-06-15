const app = require("../backend-sireska/src/app");
const PORT = process.env.PORT || 3000;
const cron                  = require("node-cron");
const updateStatusOtomatis  = require("./src/jobs/updateStatusOtomatis");

cron.schedule("* * * * *", () => {
    updateStatusOtomatis();
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});