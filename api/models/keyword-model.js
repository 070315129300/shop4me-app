'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var KeywordSchema = new Schema({
    keyword: {
      type: String,
      default: ['']
    },
    Created_date: {
      type: Date,
      default: Date.now
    },
     hits:{
        type: Number,
        default:0
    }



  });

module.exports = mongoose.model('Keyword', KeywordSchema, 'keywords');