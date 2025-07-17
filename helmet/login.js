document.getElementById("loginBtn").addEventListener("click", login);

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (res.ok) {
    alert("✅ " + data.message);
    window.location.href = "/dashboard";
  } else {
    alert("❌ " + data.message);
  }
}
