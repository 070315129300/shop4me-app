'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var TransSchema = new Schema({
    log_type: {
      type: String,
      default: ['']
    },
    log_data: {
        type: String,
        default: ['']
    },
    comments: {
        type: String,
        default: ['']
    },
    user_data: {
        type: String,
        default: ['']
    },
    data_ref: {
        type: String,
        default: ['']
    },
    created_date: {
      type: Date,
      default: Date.now
    }
  });

module.exports = mongoose.model('Trans', TransSchema, 'translog');