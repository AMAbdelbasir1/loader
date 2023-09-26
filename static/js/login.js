var googleBtn = document.getElementById("googleBtn");
var facebookBtn = document.getElementById("facebookBtn");
googleBtn.addEventListener("click", loginWithGoogle);
facebookBtn.addEventListener("click", loginWithFacebook);
function loginWithGoogle() {
  window.location.href = "/auth/google";
}

function loginWithFacebook() {
  window.location.href = "https://loader-service.onrender.com/auth/facebook";
}
