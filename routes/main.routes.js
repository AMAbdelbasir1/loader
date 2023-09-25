const express = require("express");
const { profileUser } = require("../controllers/auth.controller");
const { isAuth } = require("./guards/authguard");

const router = express.Router();
router.get("/", (req, res) => {
  res.redirect("/videos");
});
router.get("/profile", isAuth, profileUser);
module.exports = router;
