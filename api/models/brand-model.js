'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var BrandSchema = new Schema({
    name: {
      type: String,
      default: ['']
    },
    created_date: {
      type: Date,
      default: Date.now
    },
     available:{
      type: Boolean,
      default: true
    },
    total_count: {
        type: String
    },
     available:{
      type: Boolean,
      default: true
    },
    icon: {
      type: String
    }
  });

module.exports = mongoose.model('Brand', BrandSchema, 'brands');