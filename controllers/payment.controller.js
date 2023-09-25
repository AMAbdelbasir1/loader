// const open = require("open");
const { createHmac } = require("crypto");
const User = require("../models/user");
const {
  createToken,
  createPaymentKey,
  createOrder,
} = require("../services/payment.service");
const ifameOne = `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=`;

const paymentAll = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select([
      "username",
      "email",
      "_id",
      "premuim",
    ]);
    if (!user) {
      return res.status(403).redirect("/auth/logout");
    } else if (user.premuim) {
      return res.status(400).json({ msg: "you are already upgraded" });
    }
    // First request to get token
    const tokenResponse = await createToken();
    // console.log(tokenResponse);
    const authToken = tokenResponse.token;

    // Second request to make order
    const orderResponse = await createOrder(authToken, user);

    // console.log(orderResponse);
    // console.log(user);
    const orderId = orderResponse.id;
    if (!orderId) {
      return res.status(400).json({ error: paymentKeyResponse });
    }
    // Third request to get form link
    const paymentKeyResponse = await createPaymentKey(authToken, orderId, user);
    // console.log(paymentKeyResponse);
    const paymentToken = paymentKeyResponse.token;

    // Open the browser with the form link
    // open(ifameOne + paymentToken);
    if (!paymentToken) {
      return res.status(400).json({ error: paymentKeyResponse });
    }
    // Return the form link in the response
    return res.status(200).json({ url: ifameOne + paymentToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

const webhookProcessed = async (req, res) => {
  try {
    const payload = req.body.obj;
    console.log(payload.order.shipping_data);
    const {
      amount_cents,
      created_at,
      currency,
      error_occured,
      has_parent_transaction,
      id,
      integration_id,
      is_3d_secure,
      is_auth,
      is_capture,
      is_refunded,
      is_standalone_payment,
      is_voided,
      order: { id: order_id },
      owner,
      pending,
      source_data: {
        pan: source_data_pan,
        sub_type: source_data_sub_type,
        type: source_data_type,
      },
      success,
    } = payload;
    let lexogragical =
      amount_cents +
      created_at +
      currency +
      error_occured +
      has_parent_transaction +
      id +
      integration_id +
      is_3d_secure +
      is_auth +
      is_capture +
      is_refunded +
      is_standalone_payment +
      is_voided +
      order_id +
      owner +
      pending +
      source_data_pan +
      source_data_sub_type +
      source_data_type +
      success;
    let hash = createHmac("sha512", process.env.HMAC_KEY)
      .update(lexogragical)
      .digest("hex");
    console.log(success);
    if (hash === req.query.hmac) {
      if (success) {
        await User.updateOne(
          { _id: payload.order.shipping_data.extra_description },
          { premuim: true, $inc: { limit: 7 } },
        );
      }
      console.log("hash accept");
      return;
    }
    res.json({
      message: "Transaction processed webhook received successfully",
    });
  } catch (error) {
    res.status(400).json({ msg: error });
  }
};
/**************************************************************** */
const webhookResponse = (req, res) => {
  let success = req.query.success;
  if (success === "true") {
    return res.status(200).render("success");
  } else {
    return res.status(400).render("failture");
  }
};
module.exports = { paymentAll, webhookProcessed, webhookResponse };
