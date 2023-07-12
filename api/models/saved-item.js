'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SavedItem = new Schema({
  apiKey: {
    type: String,
    required: true
  },
  items: [{
  type: mongoose.Schema.Types.ObjectId, ref: 'Product'  }],
 
  item_count: {
  type: String
  },
  created_date: {
  type: Date,
  default: Date.now
  }
  });

module.exports = mongoose.model('SavedItem', SavedItem, 'saveditems');