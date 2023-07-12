"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
 

var PromoSchema = new Schema({
 
  name: {
    type: String,
    required: "Kindly enter the name of the product"
  },
  
  default_img: {
    type: String,
    default: "http://157.230.229.73/html/default_image.jpg"
  },
  
  created_date: {
    type: Date,
    default: Date.now
  },
  updated_date: {
    type: Date,
  },
  available:{ 
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("Promo", PromoSchema, "promo");
