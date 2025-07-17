import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import session from "express-session"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import passport from "passport"
dotenv.config()
const app=express()
app.use(express.json())
mongoose.connect("mongodb+srv://phaneendralaghimsetty005:9553097875amma@cluster0.egmsr7l.mongodb.net/authorranking?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err))
const userSchema=new mongoose.Schema({
  googleId:String,
  name:String,
  email:String
})
const User=mongoose.model("User",userSchema)
app.use(session({
  secret:"sercretKey",
  resave:false,
  saveUninitialized:false
}))
app.use(passport.initialize())
app.use(passport.session())
passport.use(new GoogleStrategy({
  clientID:process.env.GOOGLE_CLIENT_ID,
  clientSecret:process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:"/auth/google/callback"
},async(accessToken,refreshToken,profile,done)=>{
  const existingUser=await User.findOne({googleId:profile.id})
  if(!existingUser){
    const emailMatch = await User.findOne({ email: profile.emails[0].value });
    if (emailMatch) {
      // Link Google ID to existing user with same email
      emailMatch.googleId = profile.id;
      await emailMatch.save();
      return done(null, emailMatch);
    }
    existingUser=await new User({
      googleId:profile.id,
      name:profile.displayName,
      email:profile.emails[0].value
    }).save()
  }
  return done(null,existingUser)
}))
passport.serializeUser((user,done)=>{done(null,user.id)})
passport.deserializeUser(async(id,done)=>{
  const user=await User.findById(id)
  done(null,user)
})
app.get("/auth/google",passport.authenticate("google",{scope:["profile","email"]}))
app.get("/auth/google/callback",
  passport.authenticate("google",{
    failureRedirect:"/login-failed",
    successRedirect:"/dashboard"
  })
)
app.get("/dashboard",(req,res)=>{
  if(req.isAuthenticated()){
    res.send(`Welcome, ${req.user.name}! Email: ${req.user.email}`)
  }else{
    res.redirect("/auth/google")
  }
})
app.get("/logout",async(req,res)=>{
  req.logout(()=>{
    res.redirect("/")
  })
})
app.get("/",async(req,res)=>{
  res.send(`<h2>Welcome to the app</h2><a href="/auth/google">Login</a>`)
})
app.listen(3000,()=>{console.log("Server is running")})