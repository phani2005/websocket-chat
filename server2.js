// 📦 Required Modules
import express from "express"
import mongoose from "mongoose"
import path from "path"
import { fileURLToPath } from "url"
import helmet from "helmet"
import session from "express-session"
import passport from "passport"
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import cookieParser from "cookie-parser"
import multer from "multer"
import fs from "fs"
import cors from "cors"
import rateLimit from "express-rate-limit"
dotenv.config()

const PORT=process.env.PORT
const JWT_SECRET=process.env.JWT_SECRET
const __filename=fileURLToPath(import.meta.url)
const __dirname=path.dirname(__filename)
const app=express()

// Rate Limiting
const limiter=rateLimit({
  windowMs:15*60*1000,
  max:100,
  standardHeaders:true,
  legacyHeaders:false
})
app.use(limiter)

// Middleware
app.use(express.json())
app.use(cors())
app.use(cookieParser())
app.use(helmet())
app.use(express.static(path.join(__dirname,"reallogin")))
app.use("/uploads",express.static(path.join(__dirname,"uploads")))
app.use(session({
  secret:"Naruto",
  resave:false,
  saveUninitialized:false
}))
app.use(passport.initialize())
app.use(passport.session())

// MongoDB
mongoose.connect(process.env.MONGO_URL || "mongodb+srv://phaneendralaghimsetty005:9553097875amma@cluster0.egmsr7l.mongodb.net/authorranking?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err))

// Schema
const userSchema=new mongoose.Schema({
  username:String,
  email:String,
  password:String,
  googleId:String,
  comments:[String],
  imagePath:String
})
const User=mongoose.model("User",userSchema)

// Auth Middleware
function isAuthenticated(req,res,next){
  const token=req.cookies.token
  if(!token){
    return res.redirect("/login.html")
  }
  try{
    const decoded=jwt.verify(token,JWT_SECRET)
    req.user=decoded
    next()
  }catch(e){
    return res.status(400).json({error:e})
  }
}

// File Upload
const upload=multer({dest:path.join(__dirname,"uploads")})

// Register
app.post("/register",async(req,res)=>{
  const {username,email,password}=req.body
  const exists=await User.findOne({email})
  if(exists){
    return res.status(400).send("Email already exists")
  }
  const user=await new User({username,email,password:await bcrypt.hash(password,10)}).save()
  res.json({message:"User registered successfully"})
})

// Login
app.post("/login",async(req,res)=>{
  const {email,password}=req.body
  const user=await User.findOne({email})
  if(!user){
    return res.status(400).json({error:"Invalid email"})
  }
  const valid=await bcrypt.compare(password,user.password)
  if(!valid){
    return res.status(400).json({error:"Invalid password"})
  }
  const token=jwt.sign({id:user._id,username:user.username,email:user.email},JWT_SECRET,{expiresIn:"2h"})
  res.cookie("token",token,{httpOnly:true,sameSite:"Lax"})
  res.json({message:"User logged in successfully"})
})

// Google Auth
passport.use(new GoogleStrategy({
  clientID:process.env.GOOGLE_CLIENT_ID,
  clientSecret:process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:"/auth/google/callback"
},async(accessToken,refreshToken,profile,done)=>{
  let user=await User.findOne({googleId:profile.id})
  if(!user){
    user=await new User({
      username:profile.displayName,
      email:profile.emails[0].value,
      googleId:profile.id
    }).save()
  }
  done(null,user)
}))

passport.serializeUser((user,done)=>{done(null,user.id)})
passport.deserializeUser(async(id,done)=>{
  const user=await User.findById(id)
  done(null,user)
})

app.get("/auth/google",passport.authenticate("google",{scope:["profile","email"],prompt:"select_account"}))
app.get("/auth/google/callback",passport.authenticate("google",{failureRedirect:"/login.html"}),(req,res)=>{
  const token=jwt.sign({id:req.user.id,username:req.user.username,email:req.user.email},JWT_SECRET,{expiresIn:"2h"})
  res.cookie("token",token,{httpOnly:true,sameSite:"Lax"})
  res.redirect("/dashboard.html")
})

// Comment
app.post("/comment",isAuthenticated,async(req,res)=>{
  const {comment}=req.body
  await User.findByIdAndUpdate(req.user.id,{$push:{comments:comment}})
  res.json({message:"Comment added successfully"})
})
app.get("/comment",isAuthenticated,async(req,res)=>{
  const user=await User.findById(req.user.id)
  res.json({comments:user.comments||[]})
})

// Upload
app.post("/upload",isAuthenticated,upload.single("image"),async(req,res)=>{
  const imagePath=`/uploads/${req.file.filename}`
  await User.findByIdAndUpdate(req.user.id,{imagePath})
  res.json({message:"Image uploaded",imagePath})
})
app.post("/upload-url",isAuthenticated,async(req,res)=>{
  const {imageUrl}=req.body
  await User.findByIdAndUpdate(req.user.id,{imagePath:imageUrl})
  res.json({message:"Image uploaded",imagePath:imageUrl})
})

// Profile
app.get("/profile", isAuthenticated, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ username: user.username, email: user.email, imagePath: user.imagePath || "", comments: user.comments });
});

// Logout
app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login.html");
});

app.listen(PORT, () => console.log("✅ Server running on http://localhost:" + PORT));
