document.getElementById("login-form").addEventListener("submit",async(e)=>{
    e.preventDefault()
    const email=document.getElementById("email").value
    const password=document.getElementById("password").value
    const res=await fetch("/login",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email,password})
    })
    const data=await res.json()
    if(res.ok){
        alert(data.message)
        window.location.href="/dashboard.html"
    }else{
        alert(data.error)
    }
})
document.getElementById("google-btn").addEventListener("click",()=>{
    window.location.href="/auth/google"
})