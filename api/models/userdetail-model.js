const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserdetailSchema = new Schema({
  user: {
    type: String,
    required: true
  },
  profile_pic: {
    type: String
  },
  lat: {
    type: String
  },
  long: {
    type: String
  },
  created_date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Userdetail = mongoose.model("userdetail", UserdetailSchema);
