document.addEventListener("DOMContentLoaded", () => {
  let currentIndex = 0;
  let images = [];

  async function fetchMainBackground() {
    try {
      const res = await fetch("/main-background-images");
      const data = await res.json();
      images = data;
      console.log("Images: ", images);
      const gallery = document.getElementById("background-gallery");

      data.forEach(item => {
        const img = document.createElement("img");
        img.src = item.imgUrl;
        img.alt = item.title;
        img.onload = () => console.log("Image loaded:", img.src);
        img.onerror = () => console.error("Image failed:", img.src);
        gallery.appendChild(img);
      });

      setInterval(() => scrollGallery(1), 5000);
    } catch (e) {
      console.error("Error fetching images", e);
    }
  }

  function scrollGallery(direction) {
    if (images.length === 0) return;

    currentIndex += direction;
    if (currentIndex >= images.length) currentIndex = 0;
    if (currentIndex < 0) currentIndex = images.length - 1;

    const gallery = document.getElementById("background-gallery");
    gallery.scrollTo({
      left: currentIndex * gallery.clientWidth,
      behavior: "smooth"
    });
  }

  async function fetchListItems() {
    try {
      const res = await fetch("/list-images");
      const data = await res.json();

      const itemList = document.getElementById("item-list");

    //   data.forEach(item => {
    //     const createLinkElement = document.createElement("div");
    //     createLinkElement.classList.add("item");

    //     const createImageElement = document.createElement("img");
    //     createImageElement.src = item.imgUrl;
    //     createImageElement.alt = item.title;

    //     const createHeadingElement = document.createElement("h2");
    //     createHeadingElement.innerText = item.title;

    //     createLinkElement.appendChild(createImageElement);
    //     createLinkElement.appendChild(createHeadingElement);
    //     itemList.appendChild(createLinkElement);
    //   });
        data.forEach(item=>{
            const link=document.createElement("a")
            link.href="#"
            link.classList.add("item")
            const image=document.createElement("img")
            image.src=item.imgUrl
            image.alt=item.title
            const title=document.createElement("h2")
            title.innerText=item.title
            link.appendChild(image)
            link.appendChild(title)
            itemList.appendChild(link)
        })
    } catch (e) {
      console.error("Error fetching list items", e);
    }
  }

  fetchMainBackground();
  fetchListItems();
});