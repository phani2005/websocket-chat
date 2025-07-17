import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const server = createServer(app)
const io = new Server(server)

app.use(express.static(__dirname)) // serve frontend

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id)

  socket.on("chat-message", (msg) => {
    console.log("📩 Message from client:", msg)
    io.emit("chat-message", msg) // send to all clients
  })

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id)
  })
})

server.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"))
