import express from "express"
import rateLimit from "express-rate-limit"
const app=express()
app.use(express.json())
const limiter=rateLimit({
    windowMs:1*60*1000,
    max:5,
    message:"Too many requests,please try again after a minute",
    standardHeaders:true,
    legacyHeaders:false
})
app.use("/login",limiter)
app.post("/login",(req,res)=>{
    res.send("Login attempted successfully")
})
app.listen(3000,()=>{console.log("Server is running")})