import express from "express";
import session from "express-session";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

dotenv.config();
const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "Boruto";

// Basic middlewares
app.use(express.json());
app.use(cors());
app.use(cors({
  origin: "http://localhost:3000", // your frontend
  credentials: true // required for session cookie
}));

app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: "Naruto"
}));
app.use(passport.initialize());
app.use(passport.session());

// Path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection
mongoose.connect("mongodb+srv://phaneendralaghimsetty005:9553097875amma@cluster0.egmsr7l.mongodb.net/authorranking?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err))

// User schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  googleId: String
});
const User = mongoose.model("User", userSchema);

// Google strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  let user = await User.findOne({ googleId: profile.id });
  if (!user) {
    user = await new User({
      username: profile.displayName,
      email: profile.emails[0].value,
      googleId: profile.id
    }).save();
  }
  done(null, user);
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// Routes
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"],prompt: "select_account" }));

app.get("/auth/google/callback", passport.authenticate("google", {
  failureRedirect: "/index.html"
}), (req, res) => {
  const { username, email } = req.user;
  res.redirect(`/google-success.html?username=${username}&email=${email}`);
});

app.use(express.static(__dirname)); // Serve all HTML from current folder
app.get("/logout", (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).send("Logout failed");
    req.session.destroy(() => {
      res.clearCookie("connect.sid"); // destroy session cookie
      res.redirect("/loginbutton.html");
    });
  });
});

app.listen(PORT, () => console.log("Server is running"));
