import express from "express";
import upload from "../middleware/upload.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

router.post("/upload", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            console.log("No file received");
            return res.status(400).json({ error: "No file uploaded" });
        }

        console.log("File received:", {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });

        const result = await cloudinary.uploader.upload(
            `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
            { folder: "uploads" }
        );

        console.log("Cloudinary upload success:", result.secure_url);
        
        res.json({
            message: "File uploaded successfully",
            url: result.secure_url
        });
    } catch (e) {
        console.error("Upload error:", e);
        return res.status(500).json({ 
            error: e.message || "File upload failed",
            details: e
        });
    }
});

export default router;