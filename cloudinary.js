document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById("image");
  const resultDiv = document.getElementById("result");
  
  if (!fileInput.files[0]) {
    resultDiv.textContent = 'Please select a file';
    return;
  }

  // Create FormData PROPERLY
  const formData = new FormData();
  formData.append('image', fileInput.files[0]); // Must match Multer's field name

  // Debug: Show what's being sent
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }

  try {
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
      // Let browser set Content-Type automatically!
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }

    document.getElementById("preview").src = data.url;
    resultDiv.textContent = 'Upload successful!';
  } catch (error) {
    console.error('Upload error:', error);
    resultDiv.textContent = `Error: ${error.message}`;
  }
});