const request = require("request");
const user = require("../models/user");
const API_KEY = process.env.PAYMOB_API_KEY; // put your api key here
const INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;
function createToken() {
  return new Promise((resolve, reject) => {
    request.post(
      "https://accept.paymob.com/api/auth/tokens",
      {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: API_KEY }),
      },
      (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(JSON.parse(response.body));
        }
      },
    );
  });
}

function createOrder(authToken, userInfo) {
  return new Promise((resolve, reject) => {
    request.post(
      "https://accept.paymob.com/api/ecommerce/orders",
      {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auth_token: authToken,
          delivery_needed: "false",
          amount_cents: "1000",
          currency: "EGP",
          items: [],
          shipping_data: {
            email: userInfo.email,
            first_name: userInfo.username,
            last_name: "anyBnadam",
            phone_number: "01234568422",
            extra_description: userInfo._id.toString(),
          },
        }),
      },
      (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(JSON.parse(response.body));
        }
      },
    );
  });
}

function createPaymentKey(authToken, orderId, userInfo) {
  return new Promise((resolve, reject) => {
    request.post(
      "https://accept.paymob.com/api/acceptance/payment_keys",
      {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auth_token: authToken,
          amount_cents: "1000",
          expiration: 120,
          order_id: orderId,
          billing_data: {
            email: userInfo.email,
            first_name: userInfo.username,
            phone_number: "01234567892",
            last_name: "anyBnadam",
            street: "NA",
            building: "NA",
            floor: "NA",
            apartment: "NA",
            city: "NA",
            country: "NA",
          },
          currency: "EGP",
          integration_id: INTEGRATION_ID,
          lock_order_when_paid: "false",
        }),
      },
      (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(JSON.parse(response.body));
        }
      },
    );
  });
}

module.exports = { createOrder, createPaymentKey, createToken };
