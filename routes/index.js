const videoRoute = require("./video.routes");
const authRoute = require("./auth.routes");
const mainRoute = require("./main.routes");
const paymentRoute = require("./payment.routes");
const serverRoutes = (app) => {
  app.use("/videos", videoRoute);
  app.use("/auth", authRoute);
  app.use("/visa", paymentRoute);
  app.use("/", mainRoute);
};

module.exports = serverRoutes;
