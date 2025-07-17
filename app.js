import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import fs from "fs"
import path from "path"
import cors from "cors"
import { title } from "process";
const app = express();
app.use(express.json());
app.use(cors())
app.use(express.static("public"))
mongoose.connect("mongodb+srv://phaneendralaghimsetty005:9553097875amma@cluster0.egmsr7l.mongodb.net/authorranking?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err))
const imageItemSchema=new mongoose.Schema({
  title:String,
  description:String,
  img:{
    data:Buffer,
    contentType:String
  }
})
const ImageItem=mongoose.model("ImageItem",imageItemSchema)
const mainBackgroundImageItemSchema=new mongoose.Schema({
  title:String,
  description:String,
  img:{
    data:Buffer,
    contentType:String
  }
})
const MainBackgroundImage=mongoose.model("MainBackgroundImage",mainBackgroundImageItemSchema)
const listImageSchema=new mongoose.Schema({
  title:String,
  img:{
    data:Buffer,
    contentType:String
  }
})
const ListImage=mongoose.model("ListImage",listImageSchema)
const storage=multer.memoryStorage()
const upload=multer({storage})
app.post("/upload-mainBackgroundImage",upload.single("img"),async(req,res)=>{
  try{
    const {title,description}=req.body
    const newImageItem=new MainBackgroundImage({
      title,
      description,
      img:{
        data:req.body.Buffer||req.file.buffer,
        contentType:req.file.mimetype
      }
    })
    await newImageItem.save()
    res.send("image uploaded")
  }catch(e){
    return res.status(400).send(`Error: ${e}`)
  }
})
app.post("/upload-multer",upload.single("img"),async(req,res)=>{
  try{
    const {title,description}=req.body
    const newImageItem=new ImageItem({
      title,
      description,
      img:{
        data:req.body.Buffer||req.file.buffer,
        contentType:req.file.mimetype
      }
    })
    await newImageItem.save()
    res.send("Item saved successfully")
  }catch(e){
    return res.status(400).json({error:e})
  }
})
app.post("/upload-lists",upload.single("img"),async(req,res)=>{
  try{
    const {title}=req.body
    const newItem=new ListImage({
      title,
      img:{
        data:req.file.buffer||req.body.Buffer,
        contentType:req.file.mimetype
      }
    })
    await newItem.save()
    res.send("Image uploaded")
  }catch(e){
    return res.status(400).json({error:e})
  }
})
app.get("/items",async(req,res)=>{
  const items=await ImageItem.find({},"title description img")
  res.json(items.map(item=>({
    _id:item._id,
    title:item.title,
    description:item.description,
    imgUrl:`/image/${item._id}`
  })))
})
app.get("/image/:id",async(req,res)=>{
  const item = await ImageItem.findById(req.params.id);
  if (!item || !item.img || !item.img.data) return res.status(404).send("Not found");
  res.set("Content-Type", item.img.contentType);
  res.send(item.img.data);
})
app.get("/main-background-images", async (req, res) => {
  const images = await MainBackgroundImage.find({}, "title description img");
  res.json(
    images.map(img => ({
      _id: img._id,
      title: img.title,
      description: img.description,
      imgUrl: `/main-background-image/${img._id}`
    }))
  );
});
app.get("/main-background-image/:id", async (req, res) => {
  const image = await MainBackgroundImage.findById(req.params.id);
  if (!image) return res.status(404).send("Image not found");
  res.set("Content-Type", image.img.contentType);
  res.send(image.img.data);
});
app.get("/list-images",async(req,res)=>{
  const images=await ListImage.find({},"title img")
  res.json(
    images.map(img=>({
      _id:img._id,
      title:img.title,
      imgUrl:`/list-image/${img._id}`
    }))
  )
})
app.get("/list-image/:id",async(req,res)=>{
  const image=await ListImage.findById(req.params.id)
  if(!image){
    return res.status(400).json({error:"Image not found"})
  }
  res.set("Content-Type",image.img.contentType)
  res.send(image.img.data)
})
app.listen(3000,()=>{console.log("Server is running")})