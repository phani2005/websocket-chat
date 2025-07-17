import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { createServer } from "http";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend static files
app.use(express.static(path.join(__dirname, "websocket")));

// ✅ Explicitly serve index.html on root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "websocket", "index.html"));
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  socket.on("chat message", (msgObj) => {
    socket.broadcast.emit("chat message", msgObj);
  });
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
