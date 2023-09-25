var uploadForm = document.getElementById("uploadForm");
var loadingDiv = document.getElementById("loading");
var messageDiv = document.getElementById("message");
var uploadButton = document.querySelector("#btnSub");
var fileInput = document.querySelector('input[name="video"]');
var titleInput = document.querySelector('input[name="title"]');
var imageInput = document.querySelector('input[name="image"]');

uploadForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const limitInput = document.getElementById("limit");
  const upgradInput = document.getElementById("premuim");
  messageDiv.innerText = "";
  if (limitInput.value <= 0) {
    if (!upgradInput.value) {
      messageDiv.innerText =
        "Limit Reached ,please upgrad to upload more videos";
    } else {
      messageDiv.innerText = "reach limit. delete one and try again";
    }
    uploadButton.disabled = true;
    fileInput.disabled = true;
    titleInput.disabled = true;
    imageInput.disabled = true;
    return;
  }
  var form = e.target;
  var formData = new FormData(form);
  uploadButton.disabled = true;
  fileInput.disabled = true;
  titleInput.disabled = true;
  imageInput.disabled = true;
  var video = document.createElement("video");
  var file = form.elements.video.files[0];

  video.addEventListener("loadedmetadata", function () {
    var videoWidth = video.videoWidth;
    var videoHeight = video.videoHeight;
    var videoQuality = detectVideoQuality(videoWidth, videoHeight);
    var videoSizeBytes = file.size;
    var videoSizeMB = (videoSizeBytes / 1048576).toFixed(2);
    // Convert to megabytes
    formData.append("videoWidth", videoWidth);
    formData.append("videoHeight", videoHeight);
    formData.append("videoDuration", video.duration);

    // console.log("Video Width: " + videoWidth);
    // console.log("Video Height: " + videoHeight);
    // console.log("Video Size: " + videoSizeMB + " MB");
    // console.log("Video Quality: " + videoQuality);
    let maxduration = 120;
    if (upgradInput.value) {
      maxduration = 10 * 60;
    }
    if (video.duration > maxduration) {
      loadingDiv.style.display = "none";
      if (upgradInput.value) {
        messageDiv.innerText = "Video duration exceeds 10 minutes.";
      } else {
        messageDiv.innerText = "Video duration exceeds 2 minutes.";
      }
      enableUpload();
    } else {
      loadingDiv.style.display = "block";
      fetch("https://loader-service.onrender.com/videos/upload", {
        method: "POST",
        body: formData,
      })
        .then(function (response) {
          loadingDiv.style.display = "none";
          if (response.ok) {
            limitInput.value -= 1;
            messageDiv.innerText = "Upload successful.";
          } else {
            console.log(response.json().msg);
            messageDiv.innerText =
              response.statusText || `An error occurred while uploading.`;
          }
          enableUpload();
          resetFileInput();
          resetFormInputs();
        })
        .catch(function (error) {
          loadingDiv.style.display = "none";
          messageDiv.innerText = "An error occurred while uploading.";
        });
    }
  });

  function detectVideoQuality(width, height) {
    if (width >= 1920 && height >= 1080) {
      return "1080p";
    } else if (width >= 1280 && height >= 720) {
      return "720p";
    } else if (width >= 854 && height >= 480) {
      return "480p";
    } else if (width >= 640 && height >= 360) {
      return "360p";
    } else if (width >= 426 && height >= 240) {
      return "240p";
    } else if (width >= 256 && height >= 144) {
      return "144p";
    } else {
      return "Unknown";
    }
  }

  function enableUpload() {
    uploadButton.disabled = false;
    fileInput.disabled = false;
    titleInput.disabled = false;
    imageInput.disabled = false;
  }

  function resetFileInput() {
    fileInput.value = "";
  }

  function resetFormInputs() {
    form.reset();
  }

  video.src = URL.createObjectURL(file);
});
