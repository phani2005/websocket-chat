import express from "express"
import helmet from "helmet"
import cors from "cors"
import cookieParser from "cookie-parser"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"
const __filename=fileURLToPath(import.meta.url)
const __dirname=path.dirname(__filename)
const app=express()
app.use(express.json())
app.use(cors())
app.use(express.static(path.join(__dirname,"helmet2")))
app.use(cookieParser())
app.use(helmet({
    contentSecurityPolicy:{
        defaultSrc:["'self'"],
        scriptSrc:["'self'"],
        styleSrc:["'self'"],
        imgSrc:["'self'","data:"]
    }
}))
const users={
    username:"Phaneendra",
    password:"1234",
    sessionId:"secure"
}
function authMiddleware(req,res,next){
    const sessionCookie=req.cookies["session-id"]
    if(sessionCookie===users.sessionId){
        next()
    }else{
        res.redirect("/login.html")
    }    
}
app.post("/login",async(req,res)=>{
    const {username,password}=req.body
    if(username===users.username&&password===users.password){
        res.cookie("session-id",users.sessionId,{
            httpOnly:true,
            sameSite:"lax",
            secure:false,
            maxAge:10*60^1000
        })
        return res.json({message:"Login success"})
    }else{
        return res.status(405).json({error:"Login failed!Invalid credentials"})
    }
})
app.get("/dashboard",authMiddleware,(req,res)=>{
    res.sendFile(path.join(__dirname,"helmet2","dashboard.html"))
})
app.get("/logout",(req,res)=>{
    res.clearCookie("session-id")
    res.redirect("/login.html")
})
app.listen(3000,()=>{console.log("Server is running")})