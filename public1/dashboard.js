async function saveComment(){
    const comment=document.getElementById("commentBox").value.trim()
    if(!comment){
        return alert("Comment box is empty")
    }
    const res=await fetch("/comment",{
        method:"POST",
        credentials:"include",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({comment})
    })
    const data=await res.json()
    if(res.ok){
        alert(data.message)
        document.getElementById("commentBox").value=" "
        loadComments()
    }else{
        alert(data.error)
    }
}
async function loadComments(){
    const res=await fetch("/comment",{credentials:"include"})
    const data=await res.json()
    const commentList=document.getElementById("commentList")
    commentList.innerHTML=""
    data.comments.forEach(comment=>{
        const li=document.createElement("li")
        li.textContent=comment
        commentList.appendChild(li)
    })
}
function logout(){
    window.location.href="/logout"
}
window.onload=loadComments