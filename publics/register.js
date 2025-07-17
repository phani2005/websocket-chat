document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await res.json();
  if (res.ok) {
    alert("✅ Registered");
    window.location.href = "/login.html";
  } else {
    alert("❌ " + data.error);
  }
});
