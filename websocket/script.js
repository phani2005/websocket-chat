const socket=io()
const username=prompt("Enter your name: ")
const form=document.getElementById("form")
const input=document.getElementById("input")
const messages=document.getElementById("messages")
form.addEventListener("submit",async(e)=>{
    e.preventDefault()
    if(input.value){
        const msgObj={user:username,text:input.value}
        appendMessage(msgObj,true)
        socket.emit("chat message",msgObj)
        input.value=""
    }
})
socket.on("chat message",(msgObj)=>{
    appendMessage(msgObj,false)
})
function appendMessage(msg,isMe){
    const item=document.createElement("li")
    item.textContent=`${msg.user}:${msg.text}`
    item.className=isMe?"me":"other"
    messages.appendChild(item)
    messages.scrollTop=messages.scrollHeight
}