import cron from "node-cron";
import Story from "./../models/Story.js";


// Runs every 10 minutes
cron.schedule("*/10 * * * *", async () =>
{
    try
    {
        console.log("Running Story Archive Scheduler...");

        const result = await Story.updateMany(
        {
            expiresAt: { $lt: new Date() },
            isArchived: false
        },
        {
            isArchived: true
        });

        console.log(`Archived ${result.modifiedCount} stories`);

    }
    catch (error)
    {
        console.log("Cron error:", error.message);
    }
});