import express from "express";
import cors from "cors";
import path from "path";
import route from "./routes";
import multer from "multer";

export const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", route);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use((err: any, _req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large. Max 300KB." });
    }
    return res.status(400).json({ message: err.message });
  }

  if (err) return res.status(500).json({ message: err.message ?? "Internal Server Error" });
  next();
});
