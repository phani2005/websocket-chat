import express from "express";
import multer from "multer";
import path from "path"
import { fileURLToPath } from "url";
import fs from "fs"
const __filename=fileURLToPath(import.meta.url)
const __dirname=path.dirname(__filename)
const app=express()
app.use(express.json())
app.use("/uploads",express.static(path.join(__dirname,"uploads")))
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"uploads")
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+"_"+file.originalname)
    }
})
const upload=multer({storage:storage})
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "upload.html"));
});
app.post("/upload",upload.single("image"),(req,res)=>{
    console.log(`Uploaded file: ${req.file}`)
    res.json({message:"File uploaded",imagePath:`/uploads/${req.file.filename}`})
})
app.listen(3000,()=>{console.log("Server is running")})