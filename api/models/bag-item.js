const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BagItem = new Schema({
  apiKey: {
    type: String,
    required: true
  },
  // product: [{
  //   type: mongoose.Schema.Types.ObjectId, ref: 'Product'
  // }],
  product: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Product'
  },
  quantity: {
    type: Number,
    default: 1
  },
  check_out:{
    type: Boolean, default: false
  },
  date_created: {
    type: Date,
    default: Date.now
  }
})

 module.exports  = mongoose.model('BagItem', BagItem,'bagitem');