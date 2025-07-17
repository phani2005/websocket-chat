import express from "express"
import helmet from "helmet"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import cors from "cors"
import mongoose from "mongoose"
import passport from "passport"
import session from "express-session"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import dotenv from "dotenv"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import cookieParser from "cookie-parser"
dotenv.config()
const JWT_SECRET=process.env.JWT_SECRET
const PORT=process.env.PORT
const app=express()
app.use(express.json())
app.use(cors())
app.use(session({
    secret:"Naruto",
    resave:false,
    saveUninitialized:false
}))
app.use(passport.initialize())
app.use(passport.session())
const __filename=fileURLToPath(import.meta.url)
const __dirname=path.dirname(__filename)
app.use(express.static(path.join(__dirname,"publics")))
app.use(helmet())
app.use(cookieParser())
mongoose.connect("mongodb+srv://phaneendralaghimsetty005:9553097875amma@cluster0.egmsr7l.mongodb.net/authorranking?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err))
const userSchema=new mongoose.Schema({
    username:String,
    email:String,
    password:String,
    googleId:String,
    comment:String
})
const User=mongoose.model("User",userSchema)
function isAuthenticated(req,res,next){
    const token=req.cookies.token
    if(!token){
        res.redirect("/login.html")
    }
    try{
        const decoded=jwt.verify(token,JWT_SECRET)
        req.user=decoded
        next()
    }catch(e){
        return res.status(400).json({error:e})
    }
}
app.post("/register",async(req,res)=>{
    const {username,email,password}=req.body
    const exists=await User.findOne({email})
    if(exists){
        return res.status(400).send("User already exists with this email")
    }
    const hashedPassword=await bcrypt.hash(password,10)
    const newUser=new User({username,email,password:hashedPassword})
    await newUser.save()
    res.json({message:"User registered successfully",user:{username:newUser.username,email:newUser.email}})
})
app.post("/login",async(req,res)=>{
    const {email,password}=req.body
    const user=await User.findOne({email})
    if(!user){
        return res.status(400).send("No user found!Invalid email")
    }
    const valid=await bcrypt.verify(password,user.password)
    if(!valid){
        return res.status(400).send("Invalid password")
    }
    const token=jwt.sign({id:user._id,username:user.username,email:user.email},JWT_SECRET,{expiresIn:"2h"})
    res.json({message:"Login successfull"})
})
passport.use(new GoogleStrategy({
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
passport.serializeUser((user,done)=>{done(null,user.id)})
passport.deserializeUser(async(id,done)=>{
    const user=await User.findById(id)
    done(null,user)
})
app.get("/auth/google",passport.authenticate("google",{scope:["profile","email"]}))
app.get("/auth/google/callback",passport.authenticate("google",{failureRedirect:"/login.html"}),(req,res)=>{
    const token=jwt.sign({id:req.user._id,username:req.user.username,email:req.user.email},JWT_SECRET,{expiresIn:"2h"})
    res.cookie("token",token,{httpOnly:true,sameSite:"Lax"})
    res.redirect("/dashboard.html")
})
app.post("/comment",isAuthenticated,async(req,res)=>{
    await User.findByIdAndUpdate(req.user.id,{comment:req.body.comment})
    res.json({message:"Comment Saved"})
})
app.get("/comment",isAuthenticated,async(req,res)=>{
    const user=await User.findById(req.user.id)
    res.json({comment:user.comment||""})
})
app.get("/logout",(req,res)=>{
    res.clearCookie("token")
    res.redirect("/login.html")
})
app.listen(PORT,()=>{console.log("Server is running")})