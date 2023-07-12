const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Admin = new Schema({
 
  name: {
    type: String
  },
  password: {
    type: String,
    require: true
  },
  email:{
    type: String,
    require: true
  },
  date_created: {
    type: Date,
    default: Date.now
  }
})

 module.exports  = mongoose.model('Admin', Admin,'Admin');