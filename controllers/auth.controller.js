const User = require("../models/user");
const Session = require("../models/sessions");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { checkFoundAndDelete } = require("../services/video.service");
const { OtpMessge, sendEmail, welcomeUser } = require("../utils/sendEmail");
const loginFacbook = async (req, res) => {
  // console.log(req.user);
  try {
    const userCheck = await User.findOne(
      { integrationId: req.user.id },
      { videos: 0, __v: 0 },
    );
    if (!userCheck) {
      let user = new User({
        email: req.user?.emails ? req.user?.emails[0].value : "No Email",
        username: req.user.displayName,
        image: req.user.photos[0].value,
        integrationId: req.user.id,
      });
      req.session.userId = user._id.toString();
      req.session.email = req.user?.emails ? req.user?.emails[0].value : null;
      await user.save();
      return res.redirect("/profile");
    } else {
      const session = await Session.find({
        "session.userId": userCheck._id.toString(),
      });
      if (session.length > 1) {
        req.session.destroy(() => {
          return res
            .status(406)
            .render("error", { msg: "maximum number of login" });
        });
      } else {
        req.session.userId = userCheck._id.toString();
        req.session.email =
          userCheck.email != "No Email" ? userCheck.email : null;
        return res.redirect("/profile");
      }
    }
  } catch (error) {
    console.log(error);
    req.session.destroy(() => {
      return res.status(500).render("error", { msg: "error with login" });
    });
  }
};
/********************************************************** */
const loginGoogle = async (req, res) => {
  try {
    const userCheck = await Promise.all([
      User.findOne({ integrationId: req.user.id }, { videos: 0, __v: 0 }),
      User.findOne({ email: req.user.emails[0].value }, { videos: 0, __v: 0 }),
    ]);
    // console.log(userCheck);
    // const userCheck = await User.findOne({ integrationId: req.user.id });
    if (!userCheck[0] && !userCheck[1]) {
      let user = new User({
        email: req.user?.emails[0].value || "none",
        username: req.user?.displayName,
        image: req.user?.photos[0].value || "none",
        integrationId: req.user.id,
      });
      req.session.userId = user._id.toString();
      req.session.email = req.user?.emails[0].value;
      const welcome = welcomeUser(user.username);
      await Promise.all([
        user.save(),
        sendEmail({
          email: user.email,
          subject: welcome.subject,
          message: welcome.content,
        }),
      ]);
      return res.redirect("/profile");
    } else if (userCheck[1] && !userCheck[0]) {
      req.session.destroy(() => {
        return res
          .status(406)
          .render("error", { msg: "this email use with another account" });
      });
    } else {
      const session = await Session.find({
        "session.userId": userCheck[0]._id.toString(),
      });
      if (session.length > 1) {
        req.session.destroy(() => {
          return res
            .status(406)
            .render("error", { msg: "maximum number of login" });
        });
      } else {
        req.session.userId = userCheck[0]._id.toString();
        req.session.email = userCheck[0].email;
        return res.redirect("/profile");
      }
    }
  } catch (error) {
    console.log(error);
    req.session.destroy(() => {
      return res.status(500).render("error", { msg: "error with login" });
    });
  }
};
/************************************************************** */
const logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/auth/login");
  });
};
/*************************************************************** */
const profileUser = async (req, res) => {
  const user = await User.findOne({ _id: req.session.userId });
  if (!user) {
    return res.status(403).redirect("/auth/logout");
  }
  res.render("profile", {
    email: user.email,
    username: user.username,
    userimage: user.image,
    limit: user.limit,
  });
};
/************************************************************** */
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({
      _id: req.session.userId,
    }).select(["videos"]);
    if (!user) {
      return res.status(400).json({ msg: "user not found" });
    }
    if (user.videos.length) {
      let delvidProm = [];
      for (let vid of user.videos) {
        let videoPath = path.join(
          __dirname,
          "..",
          "uploads/videos",
          `${req.session.userId}-${vid.name}-video.mp4`,
        );
        let imagePath = path.join(
          __dirname,
          "..",
          "uploads/images",
          vid.image || "none",
        );
        delvidProm.push(checkFoundAndDelete(videoPath));
        delvidProm.push(checkFoundAndDelete(imagePath));
        for (let quality of vid.qualities) {
          videoPath = path.join(
            __dirname,
            "..",
            "uploads/videos",
            `${req.session.userId}-${vid.name}-video_${quality.height}p.mp4`,
          );
          delvidProm.push(checkFoundAndDelete(videoPath));
        }
      }
      Promise.all(delvidProm);
    }
    req.session.destroy(() => {
      res.redirect("/auth/login");
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "faild proccess" });
  }
};
/**************************************************************** */
const checkEmail = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(401).json({ msg: "email found" });
  }
  return res.status(200).json({ msg: "email not used" });
};
/***************************************************************** */
const sendOtp = async (req, res) => {
  console.log(req.body);
  const user = await User.findOne({ _id: req.session.userId });
  if (!user) {
    return res.status(404).json({ msg: "faild find user" });
  }
  const message = OtpMessge();

  // 2) If user exist, Generate hash reset random 6 digits and save it in db
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(message.otp.toString())
    .digest("hex");

  // Save hashed password reset code into db
  user.verifycode = hashedResetCode;
  // Add expiration time for password reset code (10 min)
  user.expirecode = Date.now() + 5 * 60 * 1000;

  await user.save();
  // 3) Send the reset code via email
  try {
    await sendEmail({
      email: req.body.email,
      subject: message.subject,
      message: message.content,
    });
  } catch (err) {
    console.log(err);
    user.verifycode = undefined;
    user.expirecode = undefined;

    await user.save();
    return res.status(400).json({ msg: "faild send email" });
  }
  return res
    .status(200)
    .json({ status: "Success", message: "verify code sent to email" });
};
/**************************************************************************** */
const verifyEmail = async (req, res, next) => {
  // 1) Get user based on reset code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.code)
    .digest("hex");

  const user = await User.findOne({
    verifycode: hashedResetCode,
    expirecode: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(401).json({ msg: "verify code invalid or expired" });
  }
  // 2) Reset code valid
  user.email = req.body.email;
  req.session.email = req.body.email;
  const welcome = welcomeUser(user.username);
  await Promise.all([
    user.save(),
    sendEmail({
      email: req.body.email,
      subject: welcome.subject,
      message: welcome.content,
    }),
  ]);

  res.status(200).json({
    status: "Success",
  });
};

module.exports = {
  loginFacbook,
  loginGoogle,
  logout,
  profileUser,
  deleteAccount,
  checkEmail,
  sendOtp,
  verifyEmail,
};
