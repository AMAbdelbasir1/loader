const fs = require("fs");
const rangeParser = require("range-parser");
const path = require("path");
const User = require("../models/user");
const Busboy = require("busboy");
const {
  getQualitiesToSave,
  transcodeVideo,
  checkFoundAndDelete,
  checkPathFound,
} = require("../services/video.service");

//***********************************************************

const uploadVideos = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId, { videos: 0, __v: 0 });
    // console.log(user);
    if (!user) {
      return res.status(403).redirect("/auth/logout");
    } else if (user.limit <= 0) {
      return res.status(429).json({ msg: "Limit Reached" });
    }
    const busboy = Busboy({ headers: req.headers });
    const files = {};

    busboy.on("field", function (fieldname, val) {
      if (fieldname === "title") {
        req.body.title = val;
      } else if (fieldname == "videoWidth") {
        req.body.width = val;
      } else if (fieldname == "videoHeight") {
        req.body.height = val;
      } else if (fieldname == "videoDuration") {
        req.body.duration = val;
      }
    });
    let videosNumber = 0;
    let imageNumber = 0;
    busboy.on("file", (fieldname, file, info) => {
      const { mimeType } = info;
      const ext = mimeType.split("/")[1];
      const newFilename = `${
        req.session.userId
      }-${Date.now()}-${fieldname}.${ext}`;
      let targetPath;
      if (fieldname == "video" && videosNumber == 0) {
        videosNumber++;
        targetPath = path.join(__dirname, "..", "uploads/videos", newFilename);
        file.pipe(fs.createWriteStream(targetPath));
        files[fieldname] = newFilename;
      } else if (fieldname == "image" && imageNumber == 0) {
        imageNumber++;
        targetPath = path.join(__dirname, "..", "uploads/images", newFilename);
        file.pipe(fs.createWriteStream(targetPath));
        files[fieldname] = newFilename;
      } else {
        file.resume();
      }
    });

    busboy.on("finish", async () => {
      try {
        let checkPath;
        if (Object.keys(files).length === 0) {
          return res.status(400).send("No files uploaded.");
        }
        const videoFile = files["video"];
        if (!videoFile) {
          checkPath == path.join(__dirname, "..", "uploads/images", imageFile);
          checkFoundAndDelete(checkPath);
          return res.status(400).send("video required.");
        }
        const imageFile = files["image"];
        if (!imageFile) {
          checkPath = path.join(__dirname, "..", "uploads/videos", videoFile);
          checkFoundAndDelete(checkPath);
          return res.status(400).send("Image required.");
        }
        const videoPath = path.join(
          __dirname,
          "..",
          "uploads/videos",
          videoFile,
        );

        // Detect the original video quality
        // const originalQuality = await detectVideoQuality(videoPath);
        const originalQuality = {
          width: +req.body?.width || 0,
          height: +req.body?.height || 0,
        };
        // console.log(originalQuality);
        const qualitiesToSave = getQualitiesToSave(originalQuality);
        // console.log(qualitiesToSave);
        await transcodeVideo(videoPath, qualitiesToSave);
        await User.updateOne(
          { _id: req.session.userId },
          {
            $push: {
              videos: {
                name: videoFile.split("-")[1],
                image: imageFile,
                title: req.body.title || "no title for video",
                duration: req.body.duration,
                qualities: qualitiesToSave,
              },
            },
            limit: user.limit - 1,
          },
        );

        return res.send("File uploaded successfully!");
      } catch (error) {
        console.error(error);
        return res.status(500).send("Error uploading file.");
      }
    });

    req.pipe(busboy);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error uploading file.");
  }
};

//***********************************************************

const loadVideo = async (req, res) => {
  try {
    const quality = req.query.q || "default"; // Set a default quality if not provided

    // Update the videoPath based on quality
    let videoPath;
    if (quality !== "default") {
      videoPath = path.join(
        __dirname,
        "..",
        "uploads/videos",
        `${req.session.userId}-${req.params.videoname}-video_${quality}p.mp4`,
      );
    } else {
      videoPath = path.join(
        __dirname,
        "..",
        "uploads/videos",
        `${req.session.userId}-${req.params.videoname}-video.mp4`,
      );
    }
    await checkPathFound(videoPath);

    // console.log("ennnn");
    const videoStat = fs.statSync(videoPath);
    const fileSize = videoStat.size;
    const range = req.headers.range || "bytes=0-";
    const positions = rangeParser(fileSize, range, { combine: true });

    const start = positions[0].start;
    const end = positions[0].end;
    const chunkSize = end - start + 1;

    const file = fs.createReadStream(videoPath, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4",
    };

    res.writeHead(206, head);
    file.pipe(res);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error loading file.");
  }
};

//***********************************************************

const loadImage = async (req, res) => {
  try {
    const fill = req.params.imagename.split("-");
    if (fill[0] !== req.session.userId) {
      res.status(401).json({ msg: "can't load image" });
      return;
    }

    const imagePath = path.join(
      __dirname,
      "..",
      "uploads/images",
      req.params.imagename,
    );

    await checkPathFound(imagePath);

    const stat = fs.statSync(imagePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;
      const file = fs.createReadStream(imagePath, { start, end });

      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "image/jpeg", // Update the content type according to your image format
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": "image/jpeg", // Update the content type according to your image format
      };

      res.writeHead(200, head);
      fs.createReadStream(imagePath).pipe(res);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error loading file.");
  }
};

//***********************************************************

const loadVideos = async (req, res) => {
  const userVideos = await User.findOne({ _id: req.session.userId }).select([
    "videos",
  ]);
  // console.log(userVideos);
  if (!userVideos.videos.length) {
    return res.status(404).json({ msg: "please upload videos" });
  }
  res.status(200).json(userVideos.videos);
};

//***********************************************************

const deleteVideo = async (req, res) => {
  try {
    const videoInfo = await User.findOneAndUpdate(
      { _id: req.session.userId },
      {
        $pull: {
          videos: { name: req.params.videoname },
        },
        $inc: { limit: 1 },
      },
    ).select(["videos"]);

    const vidoInfo = videoInfo.videos.filter(
      (vid) => vid.name == req.params.videoname,
    );

    let videoPath = path.join(
      __dirname,
      "..",
      "uploads/videos",
      `${req.session.userId}-${req.params.videoname}-video.mp4`,
    );
    const imagePath = path.join(
      __dirname,
      "..",
      "uploads/images",
      vidoInfo[0]?.image || "none",
    );

    let delvidProm = [];

    delvidProm.push(checkFoundAndDelete(videoPath));
    delvidProm.push(checkFoundAndDelete(imagePath));

    for (let quality of vidoInfo[0].qualities) {
      videoPath = path.join(
        __dirname,
        "..",
        "uploads/videos",
        `${req.session.userId}-${req.params.videoname}-video_${quality.height}p.mp4`,
      );
      delvidProm.push(checkFoundAndDelete(videoPath));
    }
    Promise.all(delvidProm);

    return res.status(200).json({ msg: "video deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "video deletion failed" });
  }
};

const uploadPage = async (req, res) => {
  const user = await User.findById(req.session.userId).select([
    "username",
    "limit",
    "premuim",
  ]);
  if (!user) {
    return res.status(403).redirect("/auth/logout");
  }
  return res.render("index", { limit: user.limit, premuim: user.premuim });
};
module.exports = {
  uploadVideos,
  loadVideo,
  loadVideos,
  loadImage,
  deleteVideo,
  uploadPage,
};
