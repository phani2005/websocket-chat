    async function fetchProfile() {
      const res = await fetch("/profile",{credentials:"include"});
      const data = await res.json();
      document.getElementById("username").textContent = data.username;
      document.getElementById("email").textContent = data.email;
      if (data.imagePath) document.getElementById("profileImg").src = data.imagePath;
      const list = document.getElementById("commentsList");
      data.comments.forEach(c => {
        const li = document.createElement("li");
        li.textContent = c;
        list.appendChild(li);
      });
    }

    document.getElementById("uploadForm").onsubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const res = await fetch("/upload", { method: "POST", body: formData,credentials:"include" });
      const data = await res.json();
      alert(data.message);
      console.log("Uploaded image path:", data.imagePath);
      document.getElementById("profileImg").src = data.imagePath;
    };

    document.getElementById("uploadUrlForm").onsubmit = async (e) => {
      e.preventDefault();
      const imageUrl = e.target.imageUrl.value;
      const res = await fetch("/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
        credentials:"include"
      });
      const data = await res.json();
      alert(data.message);
      console.log("Uploaded image path:", data.imagePath);
      document.getElementById("profileImg").src = data.imagePath;
    };

    document.getElementById("commentForm").onsubmit = async (e) => {
      e.preventDefault();
      const comment = e.target.comment.value;
      const res = await fetch("/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials:"include",
        body: JSON.stringify({ comment })
      });
      const data = await res.json();
      alert(data.message);
      const li = document.createElement("li");
      li.textContent = comment;
      document.getElementById("commentsList").appendChild(li);
      e.target.reset();
    };

    fetchProfile();
