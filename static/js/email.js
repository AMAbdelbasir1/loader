document.addEventListener("DOMContentLoaded", function () {
  const emailInput = document.getElementById("emailInput");
  const verifyButton = document.getElementById("verifyButton");
  const codeInputContainer = document.getElementById("codeInputContainer"); // Container for code input/button
  const codeInput = document.getElementById("codeInput");
  const sendCodeButton = document.getElementById("sendCodeButton");
  const message = document.getElementById("message");

  let countdown = 60;
  let emailVerifed = false;
  function startCountdown() {
    sendCodeButton.disabled = true;
    sendCodeButton.textContent = `Resend in ${countdown} seconds`;

    const interval = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(interval);
        sendCodeButton.disabled = false;
        sendCodeButton.textContent = "Send Code";
        countdown = 60;
      } else {
        sendCodeButton.textContent = `Resend in ${countdown} seconds`;
      }
    }, 1000);
  }

  sendCodeButton.addEventListener("click", async () => {
    const email = emailInput.value;
    console.log(email);
    if (!email) {
      message.textContent = "Please enter an email address.";
      return;
    }

    try {
      const response = await fetch("/auth/sendotp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
      });
      if (response.status === 200) {
        message.textContent = "Code sent. Check your email";
        startCountdown();
      } else {
        message.textContent = "Failed to send code.";
      }
    } catch (error) {
      console.error(error);
      message.textContent = "An error occurred.";
    }
  });

  verifyButton.addEventListener("click", async () => {
    if (!emailVerifed) {
      const email = emailInput.value;

      if (!email) {
        message.textContent = "Please enter an email address.";
        return;
      }

      try {
        const response = await fetch("/auth/checkemail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email }),
        });

        if (response.status === 200) {
          // If email is valid, show the code input and button
          codeInputContainer.style.display = "block";
          verifyButton.disabled = true;
          verifyButton.style.opacity = 0.5;
          message.textContent = "";
          emailVerifed = true;
        } else if (response.status === 401) {
          message.textContent = "Email already used.";
        } else {
          message.textContent = "An error occurred.";
        }
      } catch (error) {
        console.error(error);
        message.textContent = "An error occurred.";
      }
    } else {
      const email = emailInput.value;
      const code = codeInput.value;

      if (!email || !code) {
        message.textContent = " Email and verification code Required.";
        return;
      }

      try {
        const response = await fetch("/auth/verifyemail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email, code: code }),
        });

        if (response.status === 200) {
          window.location.href = "/profile";
        } else if (response.status === 401) {
          message.textContent = "Code expired or incorrect.";
        } else {
          message.textContent = "An error occurred.";
        }
      } catch (error) {
        console.error(error);
        message.textContent = "An error occurred.";
      }
    }
  });

  codeInput.addEventListener("keyup", () => {
    if (codeInput.value.trim().length < 6) {
      verifyButton.disabled = true;
      verifyButton.style.opacity = 0.5;
    } else {
      verifyButton.disabled = false;
      verifyButton.style.opacity = 1;
    }
  });
});
