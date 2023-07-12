var express = require("express"),
  app = express(),
  port = process.env.PORT || 3001,
  mongoose = require("mongoose"),
  Product = require("./api/models/product-model"),
  Keyword = require("./api/models/keyword-model");
var Category = require("./api/models/category-model");
var Brand = require("./api/models/brand-model");
var Trans = require("./api/models/trans-model");
var Review = require("./api/models/review");
var Order = require("./api/models/order-model");
var Bag = require("./api/models/bag-model");
var BagItem = require("./api/models/bag-item");

var Easypay = require("./api/models/translog-model");
const  sendEmail  = require('./api/helpers/helper')


var bodyParser = require("body-parser");
const multer = require("multer");
const cors = require("cors");
const Resize = require('./middleware/Resize')
const upload = require('./middleware/uploadMiddleware')
const logger = require('morgan');
var path = require("path")


// var corsOption = {
//   origin: true,
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   credentials: true,
//   exposedHeaders: ['x-auth-token']
//   };

app.use(cors({ credentials: true, origin: true }));
app.use(logger('dev'));
app.options("*", cors());

app.use(express.static(path.join(__dirname, './shop4me-app')));
app.use(express.static('uploads'));
app.use(express.static('uploads/brands'));

mongoose.Promise = global.Promise;
// mongoose.connect("mongodb://localhost/shopeasy", {
//   useNewUrlParser: true,
//   useCreateIndex: true
// });

mongoose.connect("mongodb://localhost/lidstores",{ useUnifiedTopology: true,useNewUrlParser: true }).then(() => console.log('Shop Database is ready')).catch(
    err => console.log(err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require("./api/routes/routes");
app.get('/',(req, res) =>{
  res.send('Lidstores')
})
routes(app);


//Define Routes
app.use("/new_product", require("./routes/product")); 
app.use("/update_product",require("./routes/updateProduct"));
app.use("/order", require("./routes/order"));
app.use("/keywords", require("./routes/keywords"));
app.use('/category', require('./routes/category'))
app.use('/bag', require('./routes/bag'))
app.use('/brand', require('./routes/brands')) 
app.use('/savedItem', require('./routes/saveditem'))
app.use('/review', require('./routes/review'))
app.use('/admin', require('./routes/admin'))
app.use('/banner', require('./routes/banner'))
app.use('/promo', require('./routes/promo'))

app.get('/send', (req, res) =>{
  let to ="cugwuh182@gmail.com";
  let from = 'hello@ncktech.com';
  let subject ="greetings";
  let username = "Chuks Ugwuh";
  let templateName ="order_confirmed_email.handlebars";
  // let templateName ="order_on_its_way.handlebars";
  // let templateName ="welcome_email.handlebars";
  sendEmail(req, res,username, to, from,subject, templateName);
})

app.listen(port);

console.log("Shop4me RESTful API server started on: " + port);
