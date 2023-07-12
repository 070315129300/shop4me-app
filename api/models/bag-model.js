const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BagSchema = new Schema({
  apiKey: {
    type: String,
    required: true
  },
  total_amount: {
    type: Number,
    default: 0
  },
  dispatch_amount:{
    type: Number,
    default: 0
  },
  item_count:{
    type: Number,
    default:0
  },
  bagitem: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'BagItem'
  }],
  bag_address:{
    type: String, default:''
  },
//   items: [{
//     type: mongoose.Schema.Types.ObjectId, ref: 'Product'
// }],
new:{
  type: Boolean, 
  default:true
},
lat:{
  type:String, default:'6.4327'
},
lon:{
  type: String, default:'3.4241'
},

paid:{
  type: String, default:'No'
},
status:{
  type: String, default:'pending'
},
  last_updated: {
    type: Date,
    default: Date.now
  }
})
 // module.exports = mongoose.model('Bag', BagSchema, 'bag');

 module.exports  = mongoose.model('Bag', BagSchema,'bag');