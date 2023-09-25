// const multer = require("multer");
// const path = require("path");
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const fileMime=file.mimetype.split('/')[0];
//     if(fileMime=="video"){
//     cb(null, path.join(__dirname, "..", "uploads/videos"));
//     }else{
//       cb(null, path.join(__dirname, "..", "uploads/images"));
//     }
//   },
//   filename: (req, file, cb) => {
//     const fileExtension = path.extname(file.originalname);
//     const fileName = `${Date.now()}-${file.fieldname}${fileExtension}`;
//     console.log(fileName);
//     cb(null, fileName);
//   },
// });
// const upload = multer({ storage });
// module.exports = upload;

// const uploadVideos = (req, res) => {
//   // console.log(!req.files);
//   if (!req.files) {
//     return res.status(400).send("No files uploaded.");
//   } else if (!req.files?.video) {
//     return res.status(400).send("No video file uploaded.");
//   } else if (!req.files?.image) {
//     return res.status(400).send("No image for video uploaded.");
//   }
//   // console.log(req.file.path);
//   const videoNm = `${req.session.userId}-${req.files.video[0].filename}`;
//   const imageNm = `${req.session.userId}-${req.files.image[0].filename}`;
//   const tempVideoPath = req.files.video[0].path;
//   const targetVideoPath = `uploads/videos/${videoNm}`;
//   const tempImagePath = req.files.image[0].path;
//   const targetImagePath = `uploads/images/${imageNm}`;

//   const srcVideo = fs.createReadStream(tempVideoPath);
//   const destVideo = fs.createWriteStream(targetVideoPath);
//   const srcImage = fs.createReadStream(tempImagePath);
//   const destImage = fs.createWriteStream(targetImagePath);

//   srcVideo.pipe(destVideo);
//   srcImage.pipe(destImage);

//   srcVideo.on("end", async () => {
//     try {
//       await Promise.all([
//         User.updateOne(
//           { _id: req.session.userId },
//           {
//             $push: {
//               videos: {
//                 name: `${videoNm}`,
//                 image: `${imageNm}`,
//                 title: req.body.title,
//               },
//             },
//           },
//         ),
//         fs.unlink(tempVideoPath, (err) => {
//           if (err) console.error(err);
//         }),
//         fs.unlink(tempImagePath, (err) => {
//           if (err) console.error(err);
//         }),
//       ]);
//       res.send("File uploaded successfully!");
//     } catch (error) {
//       console.log(error);
//       res.status(500).send("Error uploading file.");
//     }
//   });

//   srcVideo.on("error", (err) => {
//     console.error(err);
//     res.status(500).send("Error uploading file.");
//   });
// };
