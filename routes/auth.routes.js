const express = require("express");
const passport = require("passport");
const {
  loginFacbook,
  loginGoogle,
  logout,
  deleteAccount,
  checkEmail,
  verifyEmail,
  sendOtp,
} = require("../controllers/auth.controller");
const {
  notAuth,
  isAuth,
  notEmail,
  isAuthWitoutEmail,
} = require("./guards/authguard");
const router = express.Router();

router.get("/login", notAuth, (req, res) => {
  res.render("login");
});

router.get("/facebook", passport.authenticate("facebook"));

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/auth/login/failed" }),
  loginFacbook,
);

router.get("/logout", isAuthWitoutEmail, logout);
router.get("/deleteAccount", isAuth, deleteAccount);

router.get("/userinfo", isAuth, (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const userAgent = req.headers["user-agent"];
  console.log(userAgent);
  res.send(`IP: ${ip} <br> User Agent: ${userAgent}`);
});

// google

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get("/login/failed", (req, res) => {
  res.status(401).json({
    error: true,
    message: "log in failure",
  });
});

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/login/failed",
  }),
  loginGoogle,
);
router.get("/email", notEmail, (req, res) => {
  res.render("email");
});
router.post("/checkemail", checkEmail);
router.post("/verifyemail", verifyEmail);
router.post("/sendotp", sendOtp);

module.exports = router;
