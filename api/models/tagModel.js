'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var TagSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    icon: {
        type: String
    },
    date_created: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Tag', TagSchema, 'tag');