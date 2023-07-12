"use strict";

var mongoose = require("mongoose");
var random = require("mongoose-random");
var Bag = mongoose.model("Bag");
var Bagitem = mongoose.model('BagItem')

var Product = mongoose.model("Product");
var Category = mongoose.model("Category");
var Brand = mongoose.model("Brand");
var TransLog = mongoose.model("Trans");
var Review = mongoose.model("Review");
var Promo = require('../models/promo-model');

const Resize = require('../../middleware/Resize');
const upload = require('../../middleware/uploadMiddleware');
const path = require('path');


//get products specific to a particular vendor
exports.user_products = async (req, res) => {
  try {
    if (!req.get("Authorization")) {
      return res.status(401).json({ msg: "Unauthorized access" });
    }
    //console.log("this should return" + req.vendor);
    const products = await Product.find({ vendor: req.get("Authorization"), sold: false }).populate('user')

    if (!products) return res.json("No products found for this user");

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json("Server error");
  }
};

//list all products
exports.list_all_products = async (req, res) => {
  try {
    const products = await Product.find({})
    .populate([
      {
        path: 'category_id'}
    ])
    .populate('brandID')
    .sort({created_date: -1});
    if (!products) return res.json("No products available");

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json("Server error");
  }
};

// edit a particular product
exports.update_a_product = async (req, res) => {
  try {
    if (!req.get("Authorization")) {
      return res.status(401).json({ msg: "Unauthorized access" });
    }

    let product = await Product.findOne({ _id: req.params.id });

    if (!product) return res.status(404).json({ msg: "Product not found" });

    //destructure the incoming request body parameters
    const {
      name,
      brand_name,
      price,
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
    productFields.vendor = req.get("Authorization");
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
    if (user_data) productFields.user_data = req.get("Authorization");
    if (default_img) productFields.default_img = default_img;
    if (images) productFields.images = images;

    //Update
    product = await Product.findOneAndUpdate(
      { _id: req.params.id },
      { $set: productFields },
      { new: true }
    );

    return res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server errror");
  }
};

// delete a particular product
exports.delete_a_product = async (req, res) => {
  try {
    if (!req.get("Authorization")) {
      return res.status(401).json({ msg: "Unauthorized access" });
    }

    await Product.findOneAndRemove({ _id: req.params.id });

    res.json({ msg: "Product deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server errror");
  }
};

exports.add_brand = function (req, res) {
  var new_brand = new Brand(req.body);
  new_brand.save(function (err, brand) {
    if (err) res.send(err);
    res.json(brand);
  });
};

exports.get_all_brands = function (req, res) {
  Brand.find({}, function (err, brands) {
    if (err) res.send(err);
    res.json(brands);
  });
};

exports.get_brands = function (req, res) {
  var brandID = req.body.brandID;
  // Product.find({ brandID: brandID }, function (err, products) {
  //   if (err) res.send(err);
  //   res.json(products);
  // });

  Product.find({brandID: brandID,available: true,sold: false })
   .populate([
      {
        path: 'category_id'}
    ]).populate('brandID')
    .then(products =>{
      console.log('Regal: ', products)

      res.json(products)
    })
};


// exports.get_brands = function (req, res) {
//   var brandID = req.body.brandID;
//   Product.find({ brandID: brandID }, function (err, products) {
//     if (err) res.send(err);
//     res.json(products);
//   });
// };

//Load Dashboard - App 

exports.load_dashboard_data = async (req,res) => {
   
  try {
    const json = {};
    const apiKey = req.body.ApiKey;
  
  const categories = await Category.find({available: true})
  json.categorgies = categories;

  const brands = await Brand.find({available: true});
  json.brands = brands;

  const bag = await Bag.find({ apiKey: req.body.ApiKey });
  //const bagi = await Bagitem.find({apiKey: req.body.apiKey})

 let nb= [{
  "total_amount": "0",
  "_id": "5d24aa663b525003c77d5fee",
  "apiKey": "457cd054db67aabac35f2dbc5d4fa759",
  "items": [],
  "last_updated": "2019-07-09T14:53:26.437Z",
  "__v": 0
}]
   json.bag = nb;
  //  json.bag = bag;

  let yourRandomNumber1 = Math.floor(Math.random() * 6) + 1 ;
   const top_products = Product.find({ top_item: true, sold: false, available:true}).sort({updated_date: -1 }).length > 10 ? 
   await Product.find({ top_item: true, sold: false, available:true}).sort({updated_date: -1 })
   .populate([{path: 'category_id'}]).populate('brandID')
    :  await Product.find({ top_item: true, sold: false, available:true }).sort({updated_date: -1 })
// .limit(40) :  await Product.find({ top_item: "true", sold: false, available:true }).sort({created_date: -1 })
.populate([
      {
        path: 'category_id'}
    ]).populate('brandID')


  json.top = top_products;


  const trending = await Product.find({ trending: true, sold: false, available:true }).populate('user')
  .populate([
      {
        path: 'category_id'}
    ])
    .populate('brandID').skip(yourRandomNumber1);
  json.trending = trending;
  //json.item = bag.length > 0 ? 'nothing': ''

  //var set1 = new Set(); 

  json.promo = await Promo.find({available: true})


  // top_products.map((item, index) =>{
  //   if(bag[index]){
  //         console.log('Index: ', bagi[index].product)
  //       if(bagi[index].product.toString() === item._id.toString()){
  //         set1.add(bagi[index].product.toString())
  //         json.already_in_bag= set1
  //         console.log('Yes')
  //       }
  //   }
  // }) 
  
  // console.log('This json', json)
  
  res.json(json);
  } catch (err) {
    // console.error(err);
    res.status(500).send("Server error")
  }

  





}

//Load Dashboard - App

/*exports.load_dashboard_data = function (req, res) {
  var json = {};
  var apiKey = req.body.apiKey;
  Category.find({}, function (err, categories) {
    if (err) res.send(err);
    json.categorgies = categories;
    var top_item = "true";
    Brand.find({}, function (err, brands) {
      json.brands = brands;
      Bag.find({ apiKey: apiKey }, function (err, bag) {
        json.bag = bag;

        Product.find({ top_item: "true" })
          .sort({ created_date: -1 })
          .limit(7)
          .exec(function (err, top_products) {
            json.top = top_products;

            Product.find({ trending: "true" })
              .sort({ created_date: -1 })
              .limit(7)
              .exec(function (err, trending) {
                json.trending = trending;
                res.json(json);
              });
          });
      });
    });
  });
};*/

exports.list_products_cat = function (req, res) {
  var catID = req.body.categoryID;
  Product.find({ category: catID,available: true,sold: false  }, function (err, products) {
    if (err) res.send(err);
    res.json(products);
  });
};

/*exports.create_a_product = function(req, res) {
  var new_product = new Product(req.body);
  new_product.save(function(err, product) {
    if (err) res.send(err);
    res.json({ product });
    //log adding of product
    var new_log = new TransLog({
      log_type: "New Product Added",
      log_data: product.name,
      user_data: req.body.user_data,
      data_ref: product._id
    });
    new_log.save(function(err, new_log) {
      if (err) res.send(err);
    });
  });
}; */

/* exports.create_a_product = async (req, res) => {
  
};*/

exports.create_a_product =  async (req, res) => {
  try {
    if (!req.get("Authorization")) {
      return res.status(401).json({ msg: "Unauthorized access" });
    }

    //destructure the incoming request body parameters

    let filename;
    const imagePath = path.join(__dirname, '../../uplaods'); 
    const fileUpload = new Resize(imagePath);
        console.log('>>>>>>>>>>>>>> 1'+ Object.keys(req.body))
    console.log('>>>>>>>>>>>>>> 1'+ JSON.stringify(req.file))
    console.log('++++++++++++file body: ', req.file)
     
    const {
      name,
      brand_name,
      price,
      details,
      category_name,
      status,
      reviews,
      trending,
      top_item,
      brandID,
      category_id,
      user_data,
      default_img,
      condition,
       color,
      images
    } = req.body;

    const productFields = {};
    productFields.vendor = req.get("Authorization");
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
    if (category_id) productFields.category_id = category_id;
    if (condition) productFields.condition = condition;
    if (color) productFields.color = color;
    if (user_data) productFields.user_data = req.get("Authorization");
    if (default_img) productFields.default_img = default_img;
    if (req.file || req.file !== undefined) {
      filename = await fileUpload.save(req.file.buffer).then(file => {
        if (file) {
          console.log('>>>Image file', file)
          console.log('The whole body: ', req.body)
          productFields.images= file
        }


      });
          console.log('>>>>>>>>>>>>>> 2'+ filename)


    }

    //create product
    let product = new Product(productFields);
    await product.save();
    res.json({ product });

    //log adding of product
    var new_log = new TransLog({
      log_type: "New Product Added",
      log_data: product.name,
      user_data: req.get("Authorization"),
      data_ref: product._id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json("Server error");
  }
};

exports.updateProduct = (req, res)=>{
  Product.findOne({_id: req.body.productId})
  .then(product =>{
    if(!product){
      return res.status(401).json({error: true, message:'Product not found'})
    }else{
      Product.findOneAndUpdate({_id: req.body.productId},{
        $set:{
          name: req.body.name,
           price: req.body.price,
           brand_name: req.body.brand_name,
           delivery_channel: req.body.delivery_channel,
           category_name: req.body.category_name,
           details: req.body.details,
           status: req.body.status,
            }
      }).save().then(product =>{
        if(product){
          return res.status(200).json({error: false, message:'Product updated successfully'})
        }
      })
    }
  }).catch(err =>{
    return res.status(400).json({error: true, message:'An error occurred while updating'})
  })

}

exports.view_a_product = function (req, res) {
  Product.findById(req.body.productID, function (err, product) {
    if (err) res.send(err);
    res.json(product);
  });
};

//Reviews
exports.add_review = function (req, res) {
  var new_review = new Review(req.body);
  new_review.save(function (err, review) {
    if (err) res.send(err);
    res.json(review);
    //log adding of product
    var new_log = new TransLog({
      log_type: "New Review Entered",
      log_data: req.body.review_body,
      user_data: req.body.user_id,
      data_ref: review._id
    });
    new_log.save(function (err, new_log) {
      if (err) res.send(err);
    });
  });
};

exports.list_reviews = function (req, res) {
  Review.find({ product_id: req.body.productID }, [])
    .sort({ created_date: -1 })
    .limit(10)
    .exec(function (err, review) {
      if (err) res.send(err);
      var count = review.length;
      //var count_obj = [{count: count}];
      //var final = keyword.concat(count_obj);
      res.json(review);
    });
};

// add product to bag 
exports.add_a_bag = async (req, res) => {
  console.log('Calling me')

  if(req.body.apiKey === null || req.body.apiKey === undefined || req.body.apiKey ===''){
    return res.status(401).json({error: true, message:'apiKey is required'})
  }
    
    //create new bag

     Bag.findOne({apiKey: req.body.apiKey, new: true})
     .then(bag =>{
       if(bag){
         return res.status(401).json({error: true, message:'A bag already existing'})
       }else{
         let newBag = new Bag(req.body)
         .save()
         .then(bag =>{
               res.json({ bag });
          var new_log = new TransLog({
           log_type: "New Bag Created", 
           log_data: "Bag Created Successfully for a new user",
           user_data: req.body.apiKey,
           data_ref: bag._id 
         }).save()
         })
         .catch(err =>{
           return res.status(401).json({error: true, message:'An error occurred while adding bag'})
         })
     
       }
     })
     .catch(err =>{
       return res.status(400).json({error: true , message:'Error finding bag'})
     })
    
    // const bag = await new_bag.save()
    // console.log("working")
    // while (bag) {
    //   console.log("working")
    // }
    

    //log adding of product
   

  
}

// get routecost of each item in bag
exports.get_each_routecost = async (req, res) => {
  try {
    
    //get all bags with api key of user 
    const bag = await Bag.find({ apikey: req.body.apiKey})
  

    for (var i = 0;i<bag.length;i++){
     
        console.log(bag[i]);
      }

  
    res.json({ bag });
    
  } catch (err) {
    console.error(err)
    res.status(500).send('Server error')
  }
}

//Bag


exports.view_a_bag = function (req, res) {

    Bag.findOne({apiKey: req.body.apiKey, new:true})
    .populate('items')
    .then(bag =>{
      if(bag){
        return res.status(200).json({error: false, bag:bag})
      }else{
        return res.status(404).json({error: true, bag: bag})
      }
    })
    .catch(err =>{
      console.log('The error: ', err)
    })
};

exports.update_bag = async (req,res) => {
  console.log('Yes me')

  // if (isEmptyObject(req.body)) {
  //   // There are no queries.
  //   console.log('+++body: ', req.body)
  // } else {
  //   // There is at least one query,
  //   // or at least the query object is not empty.
  // }


  // if(req.body.apiKey === null || req.body === undefined || !req.body){
  //   return res.status(400).json({error: true, message:'Empty object'})
  // }
  // try {
  //   console.log('>>>101', req.body)
  //   const bag = await Bag.findOneAndUpdate(
  //     { apiKey: req.body.apiKey },
  //     { $set: req.body },
  //     { new: true });

  //     res.json(bag);
  // } catch (err) {
  //   console.error(err);
  //   res.status(500).send("Server error")
  // }

  if(req.body.apiKey === null || req.body.apiKey === undefined || req.body.apikey === ''){
    return res.status(400).json({error: true, message:'apikey is required'})
  }
  if(req.body.productId === null || req.body.productId === undefined || req.body.productId ===''){
    return res.status(400).json({error: true, message:'productid is required'})

  }
   
  Bag.findOne({apiKey: req.body.apiKey})
    .then(item=>{
      if(item){
        item.items.push(req.body.productId)
        item.save()
        return res.status(200).json({error: false, bag: item})
      }else{
        return res.status(404).json({error: false, message:'Bag not found'})
      }
    }).catch(err =>{
      return res.status(400).json({error: true, message:'Error pushing item to bag'})
    })
}

function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}

// This should work both there and elsewhere.
function isEmptyObject(obj) {
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false;
    }
  }
  return true;
}



// if(req.body === null || req.body === undefined){
//   return res.status(401).json({error: true, message:'Empty field not allowed'})
// }

//    Bag.findOneAndUpdate(
//     { apiKey: req.body.apiKey },
//     { $set: req.body },
//     { new: true }).then(bags =>{
//       if(bags){
//         res.status(200).json({error: false, bag:bags})
//       }
//     }).catch(err =>{
//       return res.status(400).json({error: true, message:'Error occurred while adding to bag'})
//     })


// }

/*exports.update_bag = function (req, res) {
  Bag.findOneAndUpdate(
    { apiKey: req.body.apiKey },
    req.body,
    { new: true },
    function (err, bag) {
      if (err) res.send(err);
      res.json(bag);
    }
  );
}; */

const googleMapsClient = require("@google/maps").createClient({
  key: "AIzaSyDiUJ5BCTHX1UG9SbCrcwNYbIxODhg1Fl8"
});

exports.delivery_summary = function (req, res) {
  var apiKey = req.body.apiKey;
  var bag_datas = {};
  Bag.find({ apiKey: apiKey }, function (err, bag) {
    bag_datas = bag;
    const ids = bag.map(bag => items => items.quantity);
    res.json(ids);
    //const product_ids = bag_datas.map(bag_data => bag_data.product_id);
  });

  /*var destination = req.body.destination;
  var apiKey = req.body.apiKey;
  var bag_datas = {};
  Bag.find({'apiKey': apiKey}, function (err, bag) {
    bag_datas = bag.items;
    const product_ids = bag_datas.map(bag_data => bag_data.product_id);
  });
  product_ids.forEach(function (element) {
    Product.findById(req.body.product_ids.location, function(err) {
    var final_ = '';
    });
  });

  googleMapsClient.distanceMatrix({
    origins: bag_data.items.,
    destinations: destination,
    units: 'imperial'
  }, function(err, response) {
    if (!err) {
      console.log(response.json.results);
      res.json(response);
    }
  });*/
};
