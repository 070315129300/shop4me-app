const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Banner = new Schema({
 
  url: {
    type: String
  },
 
  is_active:{
    type: Boolean, default:false
  },
  hint:{
    type: String,
  },
  date_created: {
    type: Date,
    default: Date.now
  }
})

 module.exports = Banner = mongoose.model('banner', Banner);
