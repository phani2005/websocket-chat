import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import path from "path"
import { fileURLToPath } from "url";
import helmet from "helmet"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import passport from "passport";
import { Strategy as GoogleStratergy } from "passport-google-oauth20";
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser";
dotenv.config()
const PORT=process.env.PORT
const JWT_SECRET=process.env.JWT_SECRET
const __filename=fileURLToPath(import.meta.url)
const __dirname=path.dirname(__filename)
const app=express()
app.use(express.json())
app.use(session({
    secret:"Naruto",
    resave:false,
    saveUninitialized:false
}))
app.use(cors())
app.use(express.static(path.join(__dirname,"public1")))
app.use(cookieParser())
app.use(passport.initialize())
app.use(passport.session())
mongoose.connect("mongodb+srv://phaneendralaghimsetty005:9553097875amma@cluster0.egmsr7l.mongodb.net/authorranking?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err))
const userSchema=new mongoose.Schema({
    username:String,
    email:String,
    password:String,
    googleId:String,
    comments:[String]
})
const User=mongoose.model("User",userSchema)
const authMiddleware=(req,res,next)=>{
    const token=req.cookies.token
    if(!token){
        res.redirect("login.html")
    }
    try{
        const decoded=jwt.verify(token,JWT_SECRET)
        req.user=decoded
        next()
    }catch(e){
        return res.status(400).jsno({error:e})
    }
}
app.post("/register",async(req,res)=>{
    const {username,email,password}=req.body
    const exists=await User.findOne({email})
    if(exists){
        return res.status(400).json({message:"User already exists"})
    }
    const newUser=await new User({username,email,password:await bcrypt.hash(password,10)}).save()
    res.json({message:"User registered successfully"})
})
app.post("/login",async(req,res)=>{
    const {email,password}=req.body
    const user=await User.findOne({email})
    if(!user){
        return res.status(400).json({error:"Invalid email"})
    }
    const valid=bcrypt.compare(password,user.password)
    if(!valid){
        return res.status(400).json({error:"Invalid password"})
    }
    const token=jwt.sign({id:user._id,username:user.username,email:user.email},JWT_SECRET,{expiresIn:"2h"})
    res.json({message:"User logged in successfully"})
})
passport.use(new GoogleStratergy({
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
app.get("/auth/google",passport.authenticate("google",{scope:["profile","email"],    prompt:"select_account"}))
app.get("/auth/google/callback",passport.authenticate("google",{failureRedirect:"/login.html"}),(req,res)=>{
    const token=jwt.sign({id:req.user.id,username:req.user.username,email:req.user.email},JWT_SECRET,{expiresIn:"2h"})
    res.cookie("token",token,{httpOnly:true,sameSite:"Lax"})
    res.redirect("/dashboard.html")
})
app.post("/comment",authMiddleware,async(req,res)=>{
    const {comment}=req.body
    await User.findByIdAndUpdate(req.user.id,{$push:{comments:comment}})
    res.json({message:"Comment added successfully"})
})
app.get("/comment",authMiddleware,async(req,res)=>{
    const user=await User.findById(req.user.id)
    res.json({comments:user.comments||[]})
})
app.get("/logout",(req,res)=>{
    res.clearCookie("token")
    res.redirect("/login.html")
})
app.listen(PORT,()=>{console.log("Server is running")})