// server.js
import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// 🧠 Fake user
const user = {
  username: "phani",
  password: "1234",
  sessionId: "abc123"
};
// app.use(cors({
//   origin: "http://localhost:3000",  // or wherever your frontend runs
//   credentials: true                 // 👈 this is required to allow cookies
// }));

// 🔒 Middlewares
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "helmet"))); // Serve HTML files

// 🔐 Auth middleware
function authMiddleware(req, res, next) {
  const sessionCookie = req.cookies["session-id"];
  if (sessionCookie === user.sessionId) next();
  else res.redirect("/login.html");
}

// 🟢 Login (POST)
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === user.username && password === user.password) {
    res.cookie("session-id", user.sessionId, {
      httpOnly: true,
      sameSite: "Lax",
      secure:false,
      maxAge: 15 * 60 * 1000,
    });
    return res.json({ message: "Login successful" });
  }
  res.status(401).json({ message: "Invalid credentials" });
});

// 🔐 Dashboard page (protected)
app.get("/dashboard", authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "helmet", "dashboard.html"));
});

// 🔍 Show cookie (debug)
app.get("/show-cookies", (req, res) => {
  res.json(req.cookies);
});

// 🚪 Logout
app.get("/logout", (req, res) => {
  res.clearCookie("session-id");
  res.redirect("/login.html");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
