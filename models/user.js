const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema({
  username: String,
  email: String,
  verifycode: String,
  expirecode: Date,
  image: String,
  integrationId: String,
  limit: {
    type: Number,
    default: 3,
  },
  premuim: {
    type: Boolean,
    default: false,
  },
  videos: {
    type: [
      {
        name: String,
        title: String,
        image: String,
        duration: Number,
        qualities: {
          type: Array,
          default: [],
        },
        date: {
          type: Date,
          default: new Date(),
        },
      },
    ],
    default: [],
  },
});
const user = mongoose.model("user", userSchema);
module.exports = user;
