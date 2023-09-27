const videosContainer = document.getElementById("videos-container");
videosContainer.innerHTML = "<p>loading videos ...</p>";
fetch("https://loader-service.onrender.com/videos/video")
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    // const videosContainer = document.getElementById("videos-container");
    // console.log(data);
    if (data.length) {
      videosContainer.innerHTML = `<div> <a
      class="navbar-link navbar-link-profile"
      href="https://loader-service.onrender.com/videos/watch" style="background-color: black;color: white;">Watch All</a
    ></div><br>`;
      data.sort((a, b) => {
        return b.name - a.name;
      });

      data.forEach((video, index) => {
        const videoDiv = document.createElement("div");
        videoDiv.className = "video-container";
        videoDiv.setAttribute("data-index", index);
        videoDiv.innerHTML = `<div class="video-card">
          <div class="video-image">
            <img class="video-image" src="https://loader-service.onrender.com/videos/image/${
              video.image
            }" alt="Video Image">
          </div>
          <div class="video-details">
            <h3>${video.title}</h3>
            <p>Uploaded ${getTimeAgo(video.date)}</p>
            </div>
        </div>
        <button class="fetch-button">Delete</button>
        `;
        const videoCard = videoDiv.querySelector(".video-card");
        videoCard.addEventListener("click", () => {
          window.location.href = `https://loader-service.onrender.com/videos/watch?v=${video.name}&i=${index}`;
        });

        const fetchButton = videoDiv.querySelector(".fetch-button");
        fetchButton.addEventListener("click", async (e) => {
          fetchButton.disabled = true;
          fetchButton.innerHTML = "...";
          fetchButton.style.opacity = 0.5;
          try {
            await fetchAndDeleteVideo(video.name, index);
          } catch (error) {
            fetchButton.innerHTML = "Faild delete";
            setTimeout(function () {
              fetchButton.innerHTML = "Delete";
              fetchButton.disabled = false;
              fetchButton.style.opacity = 1;
            }, 2000);
          }
        });

        videosContainer.appendChild(videoDiv);
      });
    } else {
      videosContainer.innerHTML = "<p>No videos uploaded</p>";
    }
  })
  .catch((error) => {
    console.log(error);
    const videosContainer = document.getElementById("videos-container");
    videosContainer.innerHTML = "<p>error by load...</p>";
  });

function fetchAndDeleteVideo(videoName, videoIndex) {
  // Replace the URL below with your desired API endpoint for deleting the video
  return new Promise((resolve, reject) => {
    const apiUrl = `https://loader-service.onrender.com/videos/video/${videoName}`;
    fetch(apiUrl, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          // If the response status is OK (200), the video was successfully deleted.
          console.log("Video deleted successfully");

          // Remove the video container from the DOM
          const videoContainer = document.querySelector(
            `.video-container[data-index="${videoIndex}"]`,
          );
          if (videoContainer) {
            videoContainer.remove();
            resolve(true);
          } else {
            console.log("Video container not found");
            reject(false);
          }
        } else {
          // If the response status is not OK, handle the error
          console.log("Failed to delete video");
          reject(false);
        }
      })
      .catch((error) => {
        console.error("Fetch error", error);
        reject(false);
      });
  });
  // Send a DELETE request to the API
}

function getTimeAgo(date) {
  var now = new Date();
  var uploadedDate = new Date(date);
  var diff = now - uploadedDate;
  var seconds = Math.floor(diff / 1000);

  if (seconds < 60) {
    return seconds + " second" + (seconds === 1 ? "" : "s");
  } else {
    var minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return minutes + " minute" + (minutes === 1 ? "" : "s");
    } else {
      var hours = Math.floor(minutes / 60);
      if (hours < 24) {
        return hours + " hour" + (hours === 1 ? "" : "s");
      } else {
        var days = Math.floor(hours / 24);
        if (days < 30) {
          return days + " day" + (days === 1 ? "" : "s");
        } else {
          var months = Math.floor(days / 30);
          if (months < 12) {
            return months + " month" + (months === 1 ? "" : "s");
          } else {
            var years = Math.floor(months / 12);
            return years + " year" + (years === 1 ? "" : "s");
          }
        }
      }
    }
  }
}
