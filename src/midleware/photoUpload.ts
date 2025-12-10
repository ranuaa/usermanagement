import multer from "multer";
import path from "path";
import fs from "fs";

const dir = path.join(process.cwd(), "uploads", "photos");
fs.mkdirSync(dir, { recursive: true });

export const uploadEmployeePhoto = multer({
  storage: multer.diskStorage({
    destination: (_, __, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const userId = req.params.userId;
      if (!userId) return cb(new Error("userId param is required") as any, "");

      const ext = file.mimetype === "image/png" ? ".png" : ".jpg";
      cb(null, `${userId}${ext}`);
    },
  }),
  limits: { fileSize: 300 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ["image/jpeg", "image/png"].includes(file.mimetype);
    if (!ok) return cb(new Error("Only PNG, JPG, JPEG allowed") as any, false);
    return cb(null as any, true);
  },
}
);
