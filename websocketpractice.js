import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { createServer } from "http";
import dotenv from "dotenv"
dotenv.config()
const app = express();
app.use(express.json());

const server = createServer(app);
const io = new Server(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend static files from "websocket" folder
app.use(express.static(path.join(__dirname, "websocket")));

io.on("connection", (socket) => {
  console.log("Socket id:", socket.id);
  socket.on("chat message", (msgObj) => {
    socket.broadcast.emit("chat message", msgObj);
  });
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Use Render-provided PORT
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
