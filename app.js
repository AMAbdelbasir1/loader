const express = require("express");
const request = require("request");
const path = require("path");
const compression = require("compression");
const ejs = require("ejs");
const app = express();
require("dotenv").config();
const passportSetup = require("./utils/passportconfig");
const passport = require("passport");
const session = require("express-session");
const sessionStore = require("connect-mongodb-session")(session);
const Store = new sessionStore({
  uri: process.env.DB_URI,
  collection: "sessions",
});
//
app.use(compression());
app.set("trust proxy", true);
// const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
//
// app.set("view engine", "ejs");

app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    saveUninitialized: false,
    resave: false,
    store: Store,
    cookie: { maxAge: 60 * 120 * 1000 },
  }),
);
app.use(passport.initialize());
app.use(passport.session());
// app.use(express.static("public"));
// app.use(express.static("static"));
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "static")));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(hpp());
app.use(xss());
app.use(mongoSanitize());
// connnection database
const dbConnection = require("./db/connection");
dbConnection();

// route serever
const serverRoutes = require("./routes");
serverRoutes(app);
// setInterval(function () {
//   request.get(
//     `${process.env.SERVER_HOST}/visa/hello`,
//     {
//       headers: { "Content-Type": "application/json" },
//     },
//     (error, response) => {
//       if (error) {
//         console.log(error);
//       } else {
//         console.log(response.body);
//       }
//     },
//   );
// }, 300000);
app.all("*", (req, res) => {
  return res.status(404).render("error", { msg: "PAGE NOT FOUND" });
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
