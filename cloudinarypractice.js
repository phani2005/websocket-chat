import express from "express";
import multer from "multer";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Serve frontend

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "media",
    public_id: file.originalname.split(".")[0] + "-" + Date.now(),
    allowed_formats: ["jpg", "jpeg", "png", "mp4", "webm", "mov"],
    resource_type: "auto", // 🔥 auto-detects image/video
  }),
});

const upload = multer({
  storage,
  limits: { fileSize: 2000 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpg",
      "image/jpeg",
      "image/png",
      "video/mp4",
      "video/webm",
      "video/quicktime", // for .mov
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only jpg, jpeg, png, mp4, webm, mov are allowed"));
    }
  },
});

app.post("/upload", upload.single("media"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    res.json({
      message: "✅ File uploaded successfully",
      url: file.path,
      format: file.format,
      mimetype: file.mimetype,
      size: file.size,
      originalname: file.originalname,
      public_id: file.filename,
    });
  } catch (err) {
    console.error("Upload error:", err.message || err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message || err);
  res.status(500).json({ error: err.message || "Server error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
