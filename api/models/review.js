const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Review = new Schema({
  apiKey: {
    type: String,
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Product'
  },
  name:{
    type: String, default:''
  },
  rating: {
    type: Number,
    default: 1
  },
  remarks:{
    type: String, default: ''
  },
  date_created: {
    type: Date,
    default: Date.now
  }
})

 module.exports  = mongoose.model('Review', Review,'review');