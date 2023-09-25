const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  session: Object, // The session object
  expires: Date, // The expiration date of the session
});
const sessions = mongoose.model("session", sessionSchema);
module.exports = sessions;
