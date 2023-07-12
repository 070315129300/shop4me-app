const express = require("express");
const config = require("config");
const router = express.Router();
const authe = require("../middleware/auth");
var mongoose = require("mongoose");
var Order = require('../api/models/order-model');
// var Order = mongoose.model("Order");
var Product = mongoose.model("Product");
var Bag = mongoose.model("Bag");
var TransLog = mongoose.model("Trans");
var path = require("path")
const axios = require("axios");
var querystring = require("querystring");
var mysql = require('mysql');
const shortid = require('shortid');

var con = mysql.createConnection({
    host: "157.230.229.73",
    port: '3306',
    user: "user1122",
    password: "TestPassword123",
    database: 'easydisp_easydispatch'
});

router.get("/", async (req,res) => {
    con.connect(function(err) {
      if (err) throw err;
      console.log("Connected!");
     /* con.query("INSERT INTO orders(product_name, quantity, order_type, o_latitude, o_longitude, d_latitude, d_longitude, user, seller, total_amount, paid, status, order_id) VALUES (?,?,?,?,?,?)", function (err, result, fields) {
        if (err) throw err;
        console.log(result);
      }); */
    
    });
})

const transportationCost =(orderlatitude, orderlongitude,destinationlatitude, 
  destinationlongitude,mainreq,productLong, productLat,rphone,name,email,address,delivery_cost) =>{


  console.log('==main req: ',mainreq)


  let routeCost =0;
  let data =querystring.stringify({
        lat1: orderlatitude,
        long1: orderlongitude,
        lat2: destinationlatitude,
        long2: destinationlongitude
      })
  
  console.log('Inside the transportation cost function')
  return new Promise((resolve, reject) =>{

  
    let thisDistance=10;

    return axios.post("https://user.shop4me.online/dagpayment/distance.php",
    data, {
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded',  }
    }).then(response =>{

      if(response.data){
        console.log('Calling into the first response', response.data)

        thisDistance = response.data.data
        var data2 = querystring.stringify({ 
        distance: parseFloat(response.data.data)
        });


        var header = querystring.stringify({ 
        'authorization': mainreq,
        'Content-Type': 'application/x-www-form-urlencoded',
        });


                let pairRiderData={}
                pairRiderData.longitude  =  orderlongitude,
                pairRiderData.latitude   =  orderlatitude,
                pairRiderData.dlongitude =  destinationlongitude,
                pairRiderData.dlatitude  =  destinationlatitude,
                pairRiderData.is_express =  'yes',
                pairRiderData.paid       =  'yes'

              

                  let configs = { headers: {'authorization': '237488d7a62657a760cf3bd7054c1165'} };

                
                return axios.post('https://user.shop4me.online/api/v3/pair_riders',pairRiderData, configs)
                .then(response => { 
                    console.log("When i pair the rider: ",response.data)

                    if(response){
                        var scheduleJobData = querystring.stringify({
                        quantity: 1,
                        origin: 'Shop4Me',
                        destination: address,
                        prodname: 'Shop4Me',
                        vehicletype: 'Motocycle',
                        is_express: 'yes',
                        delivery_note: '',
                        distance:thisDistance,//35.7,
                        price:delivery_cost,// 15.88,
                        longitude: productLong,//3.423990,
                        latitude: productLat,//6.424030,
                        dlongitude:destinationlongitude,//3.3514863,
                        dlatitude: destinationlatitude,//6.601838,
                        rphone: rphone,
                        rname: name,
                        sphone: '',
                        sname: 'Shop4Me',
                        is_requester:'true',
                        escrowprice: 0,
                        escrowcode:0, 
                        escrow:0,
                        payment_method: 'card',//'wallet',
                        remail: email,
                        pay_ondelivery: 0,
                        paid: 'yes',
                        payment_ext: 'yes'

                      })

                    return axios.post('https://user.shop4me.online/api/v3/new_job',scheduleJobData, configs)
                    .then(response => {  
                    console.log('===Creating job==> when i schedule Job',response.data)

                    if(response){
                      console.log('There is response: ', response.data)


                    }
                    else {
                    console.log('???????????++ no response')

                    }

                    })
                    .catch(err =>{
                      console.log(err.response)
                    //return res.status(401).json(err.response.data)

                    })


                            
                }        // let responses = response.data

                }).catch(err =>{
                console.log('Error: ', err)
                //console.log('Error: ', err)
                })
                    
                   
      }else{
            console.log('Error getting the distance')
            return reject(err)
      }
  
    }).catch(err => {
      console.log('Catcheeey: ', err)
      return reject(err)

    })
     
  })
  
}


router.post("/", async (req, res) => {
  try {
    if (!req.get("Authorization")) {
      return res.status(401).json({ msg: "Unauthorized access" });
    }
    
    console.log('its using my new route')
    //destructure the incoming request body parameters
     
    const {
      product_name,
      quantity,
      order_type,
      o_latitude,
      o_longitude,
      d_latitude,
      d_longitude,
      user,
      seller,
      total_amount
    } = req.body;

    const paid = "no";
    const status = "pending";
    const order_id = shortid.generate();

    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
       con.query("INSERT INTO orders(product_name, quantity, order_type, o_latitude, o_longitude, d_latitude, d_longitude, user, seller, total_amount, paid, status, order_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)", [product_name, quantity, order_type, o_latitude, o_longitude, d_latitude, d_longitude, user, seller, total_amount, paid, status, order_id], function (err, result, fields) {
          if (err) throw err;
          console.log(result);
          if (!err) {
            res.json({msg: 'shop4me order created successfull', order_id: order_id});
          }
         
        }); 
        
      
      });

   
  } catch (err) {
    console.error(err);
    res.status(500).json("Server error");
  }
});


// Set order as paid
router.post("/paid", async (req,res) => {
  try {
    if (!req.get("Authorization")) {
      return res.status(401).json({ msg: "Unauthorized access" });
    }

    //The querystring is very important
    var data = querystring.stringify({
      name: req.body.full_name,
      email: req.body.email,
      amount: req.body.amount,
      ref: req.body.ref,
      message: req.body.message,
      job_id: req.body.job_id,
      new_balance: req.body.new_balance,
    });

    const response = await axios.post(
      "https://user.shop4me.online/api/v2/jobs_payment",
      data, {
          headers: {
              'Authorization': req.get("Authorization"),
              'Content-Type': 'application/x-www-form-urlencoded',  }
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json("Server error")
  }
})


router.put("/:", authe, async (req, res) => {
  try {
    //destructure the incoming request body parameters
    const {
      name,
      brand_name,
      details,
      category_name,
      status,
      reviews,
      trending,
      top_item,
      brandID,
      categoryID,
      user_data,
      default_img,
      images
    } = req.body;

    const productFields = {};
    productFields.vendor = req.vendor.id;
    if (name) productFields.name = name;
    if (brand_name) productFields.brand_name = brand_name;
    if (price) productFields.price = price;
    if (details) productFields.details = details;
    if (category_name) productFields.category_name = category_name;
    if (status) productFields.status = status;
    if (reviews) productFields.reviews = reviews;
    if (trending) productFields.trending = trending;
    if (top_item) productFields.top_item = top_item;
    if (brandID) productFields.brandID = brandID;
    if (categoryID) productFields.categoryID = categoryID;
    if (user_data) productFields.user_data = user_data;
    if (default_img) productFields.default_img = default_img;
    if (images) productFields.images = images;

    await Product.findOneAndUpdate(
      { _id: req.params.product_id },
      productFields,
      function(err, product) {
        if (err) return res.json(err);
        res.json(product);
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
});



router.get('/get/:apikey', (req, res) =>{
  let apikeys = req.params.apikey.replace(/\s/g, '');
  Order.find({
    apiKey: apikeys
  })
  .populate('Bag') 
  .populate([{
    path:'bag', 
    populate: {
        path:'bagitem', 
        populate:{
       path:'product',
  }
},
    
}])
  .then(item =>{
    if(item){
      return res.status(200).json({error: false, order:item})
    }
  })
  .catch(err =>{
    return res.status(400).json({error: true,message:'Error fecthing order'})
  })
})

router.get('/getAllOrders', (req, res) =>{
  Order.find({})
  .populate('Bag')
  .populate([{
    path:'bag', 
    populate: {
        path:'bagitem', 
        populate:{
       path:'product',
  }
},
    
}])
  .then(item =>{
    if(item){
      return res.status(200).json({error: false, order:item})
    }
  })
  .catch(err =>{
    return res.status(400).json({error: true,message:'Error fecthing order'})
  })
})


router.post('/changeOrderStatus', async (req, res) =>{
  let {orderId, orderStatus } = req.body
  if(!orderId || orderId === '' || orderStatus === '' || !orderStatus){
      return res.status(400).json({error: true, message:"orderId and orderStatus are required"})
  }
  let isBagExisting = await Order.findOne({_id: req.body.orderId})
  if(!isBagExisting){
      return res.status(404).json({error: true, message:"Bag not found"})
  }else{

    isBagExisting.status = orderStatus
    isBagExisting.save().then(() =>{
        return res.status(200).json({error: false, message:`Order status updated to ${orderStatus}`})
    }).catch(err =>{
      return res.status(400).json({error: true, message:"Error updating order"})
    })
  }
})
module.exports = router;
