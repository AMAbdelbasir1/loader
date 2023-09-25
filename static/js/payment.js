const freeButton = document.getElementById("free-btn");
const premiumButton = document.getElementById("premium-btn");
const messageDiv = document.getElementById("message");

freeButton.addEventListener("click", () => {
  showMessage("Free Option always selected");
});

premiumButton.addEventListener("click", () => {
  // Fetch the premium API
  premiumButton.disabled = true;
  showMessage("Wait payment link is generating...");
  fetch("http://localhost:3000/visa/premium")
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      } else {
        response.json().then((data) => {
          showMessage(data.msg);
        });
      }
    })
    .then((data) => {
      const { url } = data;
      window.location.href = url;
    })
    .catch((error) => {
      showMessage("Error: faild fetch api");
    });
});

function showMessage(message) {
  messageDiv.textContent = message;
}
