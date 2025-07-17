import express from "express";
import nodemailer from "nodemailer"
import helmet from "helmet";
import path from "path"
import { fileURLToPath } from "url";
import fs from "fs"
import mongoose from "mongoose";
import crypto from "crypto"
import dotenv from "dotenv"
dotenv.config()
const app=express()
app.use(express.json())
const __filename=fileURLToPath(import.meta.url)
const __dirname=path.dirname(__filename)
app.use(express.static(__dirname))
mongoose.connect("mongodb+srv://phaneendralaghimsetty005:9553097875amma@cluster0.egmsr7l.mongodb.net/authorranking?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err))
const otpMap=new Map()
const userSchema=new mongoose.Schema({
    name:String,
    email:String,
    password:String
})
const User=mongoose.model("User",userSchema)
app.post("/send-otp",async(req,res)=>{
    console.log("Request body:", req.body);
    const {name,email,password}=req.body
    const exists=await User.findOne({email})
    if(exists){
        return res.status(400).json({error:"User already registered with this email"})
    }
    const otp=crypto.randomInt(100000,999999).toString()
    otpMap.set(email,{otp,name,password})
    console.log("OTP MAP: ",otpMap)
    const transporter=nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASSWORD
        }
    })
    const mailOptions={
        from:process.env.EMAIL_USER,
        to:email,
        subject:"Your OTP for registration",
        text:`Your OTP is:${otp}`
    }
    console.log("Mail Options: ",mailOptions)
    transporter.sendMail(mailOptions,(err,info)=>{
        if(err){
            return res.status(500).json({error:"Failed to send otp"})
        }
        res.json({message:"OTP sent to email"})
    })
})
app.post("/verify-otp",async(req,res)=>{
    const {email,otp}=req.body
    const record=otpMap.get(email)
    if(!record||record.otp!=otp){
        return res.status(500).json({error:"Invalid or expired otp"})
    }
    const {name,password}=record
    await new User({name,email,password}).save()
    otpMap.delete(email)
    res.json({message:"User verified and registered"})
})
app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));
