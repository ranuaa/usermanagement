import dotenv from "dotenv";
import { app } from "./app";
import { sequelize } from "./config/config";


dotenv.config();

const PORT = process.env.PORT;

const start = async () => {
  await sequelize.authenticate(); // <-- init connection + model registry siap
  console.log("DB connected.");
    app.listen(PORT, () => { console.log(`Server is running `); });
}

start().catch((err) => {
    console.error("Failed to start server:", err);
});
