import express from "express";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import mongoose, { mongo } from "mongoose";
import dotenv from "dotenv"
import cors from "cors"
import passport from "passport";
import session from "express-session";
import { Strategy as GoogleStratergy } from "passport-google-oauth20";
import path from "path"
import { fileURLToPath } from "url";
import fs from "fs"
const __filename=fileURLToPath(import.meta.url)
const __dirname=path.dirname(__filename)
dotenv.config()
const app=express()
app.use(express.json())
app.use(cors())
app.use(session({
    secret:"Naruto",
    saveUninitialized:false,
    resave:false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(express.static(path.join(__dirname, "loginfolder")));
const PORT=process.env.PORT
const JWT_SECRET=process.env.JWT_SECRET||"Boruto"
mongoose.connect("mongodb+srv://phaneendralaghimsetty005:9553097875amma@cluster0.egmsr7l.mongodb.net/authorranking?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err))
const userSchema=new mongoose.Schema({
    username:String,
    email:String,
    password:String,
    googleId:String
})
const User=mongoose.model("User",userSchema)
passport.use(new GoogleStratergy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:"/auth/google/callback"
},async(accessToken,refreshToken,profile,done)=>{
    const user=await User.findOne({googleId:profile.id})
    if(!user){
        user=await new User({
            username:profile.displayName,
            email:profile.emails[0].value,
            googleId:profile.id
        }).save()
    }
    done(null,user)
}))
passport.serializeUser((user,done)=>{
    done(null,user.id)
})
passport.deserializeUser(async(id,done)=>{
    const user=await User.findById(id)
    done(null,user)
})
app.post("/register",async(req,res)=>{
    const {username,email,password}=req.body
    const existing=await User.findOne({email})
    if(existing){
        return res.status(400).json({error:"User is already registered with this email id"})
    }
    const hashedPassword=await bcrypt.hash(password,10)
    const newUser=new User({username,email,password:hashedPassword})
    await newUser.save()
    res.json({message:"User registered successfully"})
})
app.post("/login",async(req,res)=>{
    const {email,password}=req.body
    const user=await User.findOne({email})
    if(!user){
        return res.status(400).json({error:"User not found enter valid email"})
    }
    const verify=await bcrypt.compare(password,user.password)
    if(!verify){
        return res.status(400).json({error:"Invalid password!Enter password again"})
    }
    const token=jwt.sign({userId:user._id,username:user.username,email:user.email},JWT_SECRET,{expiresIn:"1h"})
    res.json({message:"Login successfull",token,user:{username:user.username,email:user.email}})
})
app.get("/google-success",(req,res)=>{
    res.sendFile(path.join(__dirname,"login folder","google-success.html"))
})
app.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "loginfolder", "login.html"))
})

app.get("/register.html", (req, res) => {
  res.sendFile(path.join(__dirname, "loginfolder", "register.html"))
})

app.get("/profile.html", (req, res) => {
  res.sendFile(path.join(__dirname, "loginfolder", "profile.html"))
})

app.get("/index.html", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html")) // If it's outside the folder
})
app.get("/auth/google",passport.authenticate("google",{scope:["profile","email"]}))
app.get("/auth/google/callback", passport.authenticate("google", {
  failureRedirect: "/login"
}), (req, res) => {
  const token = jwt.sign({ userId: req.user._id, username: req.user.username, email: req.user.email }, JWT_SECRET, { expiresIn: "1h" });

  // Save info in localStorage not possible here since this is server-side
  // So redirect to frontend where browser handles it

  res.redirect(`http://localhost:3000/google-success?username=${req.user.username}&email=${req.user.email}`);
});
app.listen(PORT,()=>{console.log("Server is running")})