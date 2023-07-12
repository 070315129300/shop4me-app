'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var EasypaySchema = new Schema({
    merchant_id: {
      type: String,
      default: ['']
    },
    merchant_name: {
        type: String,
        default: ['']
    },
    amount: {
        type: String,
        default: ['']
    },
    address: {
        type: String,
        default: ['']
    },
    details: {
        type: String,
        default: ['']
    },
    trans_ref: {
        type: String,
        default: ['']
    },
    images: [{
      type: String
    }],
    created_date: {
      type: Date,
      default: Date.now
    }
  });

module.exports = mongoose.model('Easypay', EasypaySchema, 'easypay');