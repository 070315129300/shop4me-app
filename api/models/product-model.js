"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
 

var ProductSchema = new Schema({
  vendor: {
    type: String,
    ref: "vendor"
  },
  name: {
    type: String,
    required: "Kindly enter the name of the product"
  },
  brand_name: {
    type: String
  },
  brandID:{
    type:mongoose.Schema.Types.ObjectId, ref:'Brand'
  },
  
  price: {
    type: String,
    default: "0"
  },
  default_img: {
    type: String,
    default: "http://157.230.229.73/html/default_image.jpg"
  },
  
  tags: [{type: String}],
  category_id:{
    type:mongoose.Schema.Types.ObjectId, ref:'Category'
  },
   user: [
        {
            type: mongoose.Schema.Types.ObjectId, ref: 'userdetail'
        }
    ],
  images: [
    {
      type: String,
      required: true
    }
  ],
  details: {
    type: String,
    required: true
  },
  address: [
    {
      latitude: String,
      longitude: String,
      description: String
    }
  ],
  category_name: {
    type: String
  },

  reviews: {
    type: String
  },
  trending: {
    type: Boolean,
    default:false
  },
  user_data: {
    type: String,
    required: true
  },
  top_item: {
    type: Boolean,
    default: false
  },
  hot_products: {
    type: Boolean,
    default: false
  },
  delivery_channel: {
    type: String,
    required: true
  },
  sold: {
   type: Boolean,
   default: false
  },
  created_date: {
    type: Date,
    default: Date.now
  },
  updated_date: {
    type: Date,
  },
  status: {
    type: String,
    default: "pending"
  }, 
  costPrice:{
    type:String,default:''
  },
  available:{
    type: Boolean,
    default: true
  },
  lidPrice:{type:String, default:''},
  productSize:{type:String, default:''},
  quantity:{type:String, default:""},
  color:{type: String, default:''},
  condition:{type: String, default:''} ,
  model:{type: String, default:''},
  promoID:{
    type:mongoose.Schema.Types.ObjectId, 
    ref:'Promo',
    default: null
  },
  on_promo: {
    type: Boolean,
    default:false
  },
});
 
module.exports = mongoose.model("Product", ProductSchema, "products");
