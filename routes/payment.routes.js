const express = require("express");
const {
  paymentAll,
  webhookProcessed,
  webhookResponse,
} = require("../controllers/payment.controller");
const { isAuth } = require("./guards/authguard");

const router = express.Router();

router.get("/hello", (req, res) => res.send("Hello World!"));
router.get("/pricing", isAuth, (req, res) => res.render("payment"));

router.get("/premium", isAuth, paymentAll);
router.post("/webhook/processed", webhookProcessed);

router.get("/webhook/response", webhookResponse);
module.exports = router;
