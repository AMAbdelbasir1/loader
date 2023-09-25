const express = require("express");
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // 5 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
const {
  uploadVideos,
  loadVideo,
  loadVideos,
  loadImage,
  deleteVideo,
  uploadPage,
} = require("../controllers/video.controllers");
const { isAuth } = require("./guards/authguard");

const router = express.Router();

router.get("/", isAuth, uploadPage);

router.get("/watch", isAuth, (req, res) => {
  res.render("video");
});

router.post("/upload", isAuth, limiter, uploadVideos);

router.get("/video", isAuth, loadVideos);
router
  .route("/video/:videoname")
  .get(isAuth, loadVideo)
  .delete(isAuth, deleteVideo);
router.get("/image/:imagename", isAuth, loadImage);
module.exports = router;
