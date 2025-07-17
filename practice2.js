import express from "express"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import passport from "passport"
import bcrypt from "bcrypt"
import session from "express-session"
import { Strategy as GoogleStratergy } from "passport-google-oauth20"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(express.json())
app.use(cors({ origin: "http://localhost:3000", credentials: true }))

app.use(session({
    secret: "naruto",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

const PORT = process.env.PORT || 3000
const JWT_SECRET = process.env.JWT_SECRET || "Boruto"

mongoose.connect("mongodb+srv://phaneendralaghimsetty005:9553097875amma@cluster0.egmsr7l.mongodb.net/authorranking?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err))

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    googleId: String
})

const User = mongoose.model("User", userSchema)

passport.use(new GoogleStratergy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    let user = await User.findOne({ googleId: profile.id })
    if (!user) {
        user = await new User({
            username: profile.displayName,
            googleId: profile.id,
            email: profile.emails[0].value
        })
        await user.save()
    }
    done(null, user)
}))

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id)
    done(null, user)
})

app.post("/register", async (req, res) => {
    const { username, email, password } = req.body
    const existing = await User.findOne({ email })
    if (existing) {
        return res.status(400).json({ error: "User already exists with this email" })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({ username, email, password: hashedPassword })
    await newUser.save()
    res.json({ message: "User registered successfully" })
})

app.post("/login", async (req, res) => {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) {
        return res.status(400).json({ error: "No user found with such email. Please check the email" })
    }
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
        return res.status(400).json({ error: "Invalid password" })
    }
    const token = jwt.sign({ id: user._id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: "2m" })
    res.json({ message: "User logged in successfully", token, user: { username: user.username, email: user.email } })
})

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }))

app.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), (req, res) => {
    // after login success, redirect to your HTML dashboard
    res.redirect("/dashboard")
})

// 🟢 Serve dashboard.html file
app.get("/dashboard", (req, res) => {
    if (req.isAuthenticated()) {
        res.sendFile(path.join(__dirname, "dashboard.html"))
    } else {
        res.redirect("/auth/google")
    }
})

// 🟢 Serve user data to frontend
app.get("/user", (req, res) => {
    if (req.isAuthenticated()) {
        res.json({
            username: req.user.username,
            email: req.user.email
        })
    } else {
        res.status(401).json({ error: "Not authenticated" })
    }
})

app.get("/logout", (req, res) => {
    req.logout(() => {
        res.redirect("/")
    })
})

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"))
})


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
