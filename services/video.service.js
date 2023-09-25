const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
// ffmpeg.setFfprobePath("C:\\PATH_PROGRAM\\ffprobe");
// const detectVideoQuality = (inputPath) => {
//   return new Promise((resolve, reject) => {
//     ffmpeg.ffprobe(inputPath, (err, metadata) => {
//       if (err) {
//         reject(err);
//       } else {
//         const width = metadata.streams[0].width;
//         const height = metadata.streams[0].height;
//         resolve({ width, height });
//       }
//     });
//   });
// };

const getQualitiesToSave = (originalQuality) => {
  const qualities = [
    { width: 1920, height: 1080 }, // 1080p
    { width: 1280, height: 720 }, // 720p
    { width: 854, height: 480 }, // 480p
    { width: 640, height: 360 }, // 360p
    { width: 426, height: 240 }, // 240p
    { width: 256, height: 144 }, // 144p
  ];
  // Determine how many qualities to save based on the original width
  let qualitiesToSave = [];
  let i = 0;
  for (const quality of qualities) {
    if (
      originalQuality.width >= quality.width &&
      originalQuality.height >= quality.height
    ) {
      qualitiesToSave.push(quality);
    } else {
      i++;
    }
  }
  return qualitiesToSave;
};

const transcodeVideo = (inputPath, qualitiesToSave) => {
  return new Promise((resolve, reject) => {
    const transcodedVideos = qualitiesToSave.map((quality) => {
      const outputPath = inputPath.replace(".mp4", `_${quality.height}p.mp4`);

      const command = ffmpeg(inputPath)
        .videoCodec("libx264")
        .audioCodec("aac")
        .outputOptions(`-vf scale=${quality.width}:${quality.height}`)
        .on("end", () => {})
        .on("error", (err) => {
          reject(err);
        });

      command.save(outputPath);
    });

    Promise.all(transcodedVideos)
      .then(() => {
        resolve(true);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
const checkFoundAndDelete = (Checkpath) => {
  return new Promise((resolve, reject) => {
    fs.access(Checkpath, fs.constants.F_OK, (err) => {
      if (err) {
        reject(err); // Reject with the error
      } else {
        fs.unlink(Checkpath, (err) => {
          if (err) {
            console.error(err);
          }
          resolve(); // Resolve without a value since deletion succeeded
        });
      }
    });
  });
};
const checkPathFound = (Checkpath) => {
  return new Promise((resolve, reject) => {
    fs.access(Checkpath, fs.constants.F_OK, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
};
module.exports = {
  getQualitiesToSave,
  transcodeVideo,
  // detectVideoQuality,
  checkFoundAndDelete,
  checkPathFound,
};
