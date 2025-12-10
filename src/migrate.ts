import express from "express";
import dotenv from "dotenv";
import { sequelize } from "./config/config";
import { createDatabaseIfNotExists } from "./config/CreateDb";
import { seedAdminUser } from "./config/adminSeeder";

dotenv.config();

const app = express();

app.get("/ceks", (_, res) => res.json({ok: true}));

const starter = async () => {

    console.log("Starting application...");
    await createDatabaseIfNotExists();
    console.log("Database checked/created.");
    await sequelize.authenticate();
    console.log("Database connected successfully.");    
    await sequelize.sync({ alter: true }); 
    await seedAdminUser();
    console.log("Database synchronized and admin user seeded if necessary.");
    await sequelize.close();
    console.log("Done. Exiting...");
    console.log("Database synchronization complete");
    process.exit(0);
}

starter().catch((err) => {
    console.error("Unable to connect to the database:", err);
    process.exit(1);
});