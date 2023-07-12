'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OrderSchema = new Schema({
  apiKey:{
    type: String,
  },
  total_amount: {
    type: String, 
    default: '0'
  },
  bag: {
      type: mongoose.Schema.Types.ObjectId, ref: 'Bag'
    }, 
  order_data: {
    type: String
  },
  pickup: {
    type: String
  },
  dropoff: {
    type: String,
    default:'no'
  },
  seller_data: {
    type: String,
    // required: true
  },
  created_date: {
    type: Date,
    default: Date.now
  },
  status: {
      type: String,
      default:'pending'
  },
  job_id:{
    type:String
  },
  order_id:{
    type:String
  },

  order_total:{
    type: Number, default:0
  },
  payment_method:{
    type:String
  },
  delivery_address:{
    type:String
  },
  customer_name:{
    type:String
  },
  customer_mobile:{
    type:String
  },
  customer_email:{
    type: String
  },
  paid: {
    type: Boolean,default: false
},
card_details:{
  type: String
},
receiver_lat:{
  type: String
},
receiver_long:{
  type: String
},

});

module.exports = mongoose.model('Order', OrderSchema, 'orders');