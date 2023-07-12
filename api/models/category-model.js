'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var CategorySchema = new Schema({
    name: {
      type: String,
      required:true,
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
    icon: {
      type: String,
      required:true
    }
  });

module.exports = mongoose.model('Category', CategorySchema, 'category');