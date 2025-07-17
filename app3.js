import express from "express"
import mongoose from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"
import session from "express-session"
import cors from "cors"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import passport from "passport"
import dotenv from "dotenv"
import helmet from "helmet"
dotenv.config()
const __filename=fileURLToPath(import.meta.url)
const __dirname=path.dirname(__filename)
const PORT=process.env.PORT
const JWT_SECRET=process.env.JWT_SECRET
const app=express()
app.use(express.json())
app.use(session({
    resave:false,
    secret:"Naruto",
    saveUninitialized:false
}))
app.use(helmet())
app.use(cors())
app.use(passport.initialize())
app.use(passport.session())
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
app.use(express.static(path.join(__dirname,"loginfolder")))
app.post("/register",async(req,res)=>{
    const {username,email,password}=req.body
    const existing=await User.findOne({email})
    if(existing){
        return res.status(400).send("User already exists")
    }
    const hashedPassword=await bcrypt.hash(password,10)
    const newUser=await new User({username,email,password:hashedPassword}).save()
    res.json({message:"User registered successfully",user:{username:newUser.username,email:newUser.email}})
})
app.post("/login",async(req,res)=>{
    const {email,password}=req.body
    const user=await User.findOne({email})
    if(!user){
        return res.status(400).json({error:"User doesn't exists"})
    }
    const valid=await bcrypt.compare(password,user.password)
    if(!valid){
        return res.status(400).send("Invalid password")
    }
    const token=await jwt.sign({userId:user._id,username:user.username,email:user.email},JWT_SECRET,{expiresIn:"1h"})
    res.json({message:"User loggedin successfully",token,user:{username:user.username,email:user.email}})
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
app.get("/auth/google",passport.authenticate("google",{
    scope:["profile","email"],
    prompt:"select_account"
}))
app.get("/auth/google/callback",passport.authenticate("google",{failureRedirect:"/login"}),(req,res)=>{
    const {username,email}=req.user
    res.redirect(`/google-success.html?username=${username}&email=${email}`)
})
app.get("/logout",async(req,res)=>{
    req.logout(err=>{
        if(err) return res.status(400).json({error:err})
        req.session.destroy(()=>{
            res.clearCookie("conncet.sid")
            res.redirect("/index.html")
        })
    })
})
app.listen(PORT,()=>{console.log("Server is running")})