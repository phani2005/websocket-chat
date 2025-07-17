window.onload = async () => {
  const res = await fetch("/comment", { credentials: "include" });
  const data = await res.json();
  document.getElementById("comment-box").value = data.comment;
};

async function saveComment() {
  const comment = document.getElementById("comment-box").value;
  const res = await fetch("/comment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ comment }),
  });
  const data = await res.json();
  document.getElementById("status").innerText = data.message;
}

function logout() {
  window.location.href = "/logout";
}
