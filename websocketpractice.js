import express from "express"
import path from "path"
import { fileURLToPath } from "url"
import {Server} from "socket.io"
import { createServer } from "http"
import { create } from "domain"
const app=express()
app.use(express.json())
const server=createServer(app)
const io=new Server(server)
const __filename=fileURLToPath(import.meta.url)
const __dirname=path.dirname(__filename)
app.use(express.static(path.join(__dirname,"websocket")))
io.on("connection",(socket)=>{
    console.log("Socket id: ",socket.id)
    socket.on("chat message",(msgObj)=>{
        socket.broadcast.emit("chat message",msgObj)
    })
    socket.on("disconnect",()=>{
        console.log("User disconnected: ",socket.id)
    })
})
server.listen(3000,()=>{console.log("Server is running")})