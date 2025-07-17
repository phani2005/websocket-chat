async function login(){
    const email=document.getElementById("email").value 
    const password=document.getElementById("password").value
    const res=await fetch("/login",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email,password})
    })
    const data=await res.json()
    console.log("Login data: ",data)
    if(res.ok){
        alert(data.message)
        window.location.href="dashboard.html"
    }else{
        alert(data.error)
    }
}
function googleLogin(){
    window.location.href="/auth/google"
}