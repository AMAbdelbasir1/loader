var url = window.location.href;
var urlObj = new URL(url);
var v = urlObj.searchParams.get("v");
var i = urlObj.searchParams.get("i");
var currentVideoIndex = 0;
if (v) {
  var videoPlayer = document.getElementById("videoPlayer");
  var er = loadFetchVideo(v)
    .then((video) => {
      videoPlayer.src = video;
      videoPlayer.play();
      return true;
    })
    .catch((error) => {
      var container = document.querySelector(".container");
      container.innerHTML = "";
      var errorMessage = document.createElement("p");
      errorMessage.textContent = error.message;
      container.appendChild(errorMessage);
      throw "error";
    });
}
if (i) {
  currentVideoIndex = +i;
}
if (er) {
  er.then((data) => {
    loadVideos();
  }).catch((err) => {
    console.log(err);
  });
} else {
  loadVideos();
}
function loadVideos() {
  fetch("/videos/video")
    .then((response) => {
      if (!response.ok) {
        if (response.status == 404) {
          throw new Error("please upload videos to can watch");
        }
        throw new Error("Failed to fetch video");
      }
      console.log("errrrrrrrrrrrrrrrrr");
      return response.json();
    })
    .then((videos) => {
      videos.sort((a, b) => {
        return b.name - a.name;
      });
      var videoPlayer = document.getElementById("videoPlayer");
      var video_Player = document.getElementById("vidCon");
      const qualitySelect = document.getElementById("qualitySelect");
      var prevButton = document.getElementById("prevButton");
      var nextButton = document.getElementById("nextButton");

      function loadAndPlayVideo(index) {
        urlObj.searchParams.set("v", videos[index].name);
        urlObj.searchParams.set("i", index);

        // Update the URL without reloading the page
        history.pushState({}, "", urlObj);
        loadFetchVideo(videos[index].name)
          .then((video) => {
            videoPlayer.src = video;
            videoPlayer.play();
            prevButton.disabled = index === 0;
            nextButton.disabled = index === videos.length - 1;
            console.log(videos[index].qualities);
            populateQualityOptions(videos[index].qualities);
          })
          .catch((error) => {
            videoPlayer.remove();
            var errorMessage = document.createElement("p");
            errorMessage.textContent =
              "Error occurred while playing the video.";
            video_Player.appendChild(errorMessage);
          });
      }

      function goToPreviousVideo() {
        if (currentVideoIndex > 0) {
          currentVideoIndex--;
          loadAndPlayVideo(currentVideoIndex);
        }
      }

      function goToNextVideo() {
        if (currentVideoIndex < videos.length - 1) {
          currentVideoIndex++;
          loadAndPlayVideo(currentVideoIndex);
        }
      }
      function populateQualityOptions(qualities) {
        qualitySelect.innerHTML = "";
        const option = document.createElement("option");
        option.value = `default`;
        option.textContent = `default`;
        qualitySelect.appendChild(option);
        for (const quality of qualities) {
          const option = document.createElement("option");
          option.value = quality.height;
          option.textContent = `${quality.height}`;
          qualitySelect.appendChild(option);
        }
      }
      if (!v) {
        loadAndPlayVideo(currentVideoIndex);
      } else {
        if (currentVideoIndex > videos.length - 1) {
          currentVideoIndex = videos.length - 1;
        } else if (currentVideoIndex < 0) {
          currentVideoIndex = 0;
        }
        prevButton.disabled = currentVideoIndex === 0;
        nextButton.disabled = currentVideoIndex === videos.length - 1;
        populateQualityOptions(videos[currentVideoIndex].qualities);
      }

      prevButton.addEventListener("click", goToPreviousVideo);
      nextButton.addEventListener("click", goToNextVideo);
      qualitySelect.addEventListener("change", async (event) => {
        const selectedQuality = event.target.value;
        var vn = urlObj.searchParams.get("v");
        // Make an AJAX request to fetch the video with the selected quality
        const currentPlaybackTime = videoPlayer.currentTime;
        try {
          const currentVideoSrc = `/videos/video/${vn}?q=${selectedQuality}`;

          const response = await fetch(currentVideoSrc);
          if (!response.ok) {
            throw new Error("Failed to fetch video.");
          } else {
            const videoURL = currentVideoSrc;
            // Update the video source with the selected quality
            videoPlayer.src = videoURL;
            videoPlayer.play();
            videoPlayer.currentTime = currentPlaybackTime;
          }
        } catch (error) {
          console.error(error);
          // Handle error (e.g., display an error message to the user)
        }
      });
    })
    .catch((error) => {
      var container = document.querySelector(".container");
      container.innerHTML = "";
      var errorMessage = document.createElement("p");
      errorMessage.textContent = error.message;
      container.appendChild(errorMessage);
    });
}
async function loadFetchVideo(video) {
  const videoURL = `/videos/video/${video}?q=default`;

  // Create a Promise to handle the video loading
  const res = await fetch(videoURL);
  if (res.ok) {
    return videoURL;
  } else if (res.status == 404) {
    throw new Error("Video Not Found");
  } else {
    throw new Error("Error loding video");
  }
}
