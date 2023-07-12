"use strict";

var mongoose = require("mongoose");
var random = require("mongoose-random");
var Userdetail = require("../models/userdetail-model");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var config = require("config");
const axios = require("axios");
var querystring = require("querystring");

/*exports.register = async (req, res) => {
  const { fname, lname, phone, email, password } = req.body;

  try {
    // check if vendor already exists
    let vendor = await Vendor.findOne({ email: email });

    if (vendor) {
      return res.status(400).json({ errors: [{ msg: "User already exists" }] });
    }

    //create new vendor
    vendor = new Vendor({
      fname,
      lname,
      email,
      phone,
      password
    });
    //Encrypt Password before saving vendor
    // generate salt with bcrypt
    const salt = await bcrypt.genSalt(10);
    // hash user password to be saved into the database
    vendor.password = await bcrypt.hash(password, salt);

    await vendor.save();

    //get jsonwebtoken
    const payload = {
      vendor: {
        id: vendor.id
      }
    };

    jwt.sign(
      payload,
      config.get("jwtSecret"),
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json("Server error");
  }
};*/

exports.register = async (req, res) => {
  try {
    //The querystring is very important
    var data = querystring.stringify({
      fname: req.body.fname,
      lname: req.body.lname,
      phone: req.body.phone,
      email: req.body.email,
      password: req.body.password
    });


    const regDetails = {};
    const response = await axios.post(
      "https://user.shop4me.online/api/v1/register",
      data
    );

    regDetails.error = response.data.error;
    regDetails.fname = response.data.fname;
    regDetails.lname = response.data.lname;
    regDetails.apiKey = response.data.api_key;
    regDetails.message = response.data.message;

    const {
      lat,
      long
    } = req.body;

    const userDetailFields = {};
    userDetailFields.user = response.data.api_key;
    if (lat) userDetailFields.lat = lat;
    if (long) userDetailFields.long = long;

    // insert lat and long details into userdetail collection
    let userdetails = new Userdetail(userDetailFields);
    await userdetails.save();

    regDetails.user_id = userdetails._id;
  
    //console.log(response);
    res.status(200).json(regDetails);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

/*exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    //See if user exists
    let vendor = await Vendor.findOne({ email: email });

    if (!vendor) {
      return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
    }

    //check  if email and password matches
    const isMatch = await bcrypt.compare(password, vendor.password);

    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
    }
    //return jsonwebtoken
    const payload = {
      vendor: {
        id: vendor.id
      }
    };
    jwt.sign(
      payload,
      config.get("jwtSecret"),
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
}; */

exports.login = async (req, res) => {
  try {
    //The querystring is very important
    var data = querystring.stringify({
      email: req.body.email,
      password: req.body.password
    });

    const loginDetails = {};
    //var token = {}
    const response = await axios.post(
      "https://user.shop4me.online/api/v1/login",
      data
    );

    loginDetails.error = response.data.error;
    loginDetails.fname = response.data.fname;
    loginDetails.lname = response.data.lname;
    loginDetails.apiKey = response.data.apiKey;
    loginDetails.profile_pic = response.data.profile_pic;
    var userApiKey = response.data.apiKey;
    loginDetails.message = response.data.message;
     console.log('this is the userApiKey:' + userApiKey);

    // find the user with api key and return the id
    let userdetails = await Userdetail.find({ user: userApiKey });

    //console.log("see this" + userdetails);
    if (!userdetails.length) {
      console.log("got here");
      let userDetailFields = {};
      userDetailFields.user = userApiKey;
      if (loginDetails.profile_pic) userDetailFields.profile_pic = loginDetails.profile_pic;
      userdetails = new Userdetail(userDetailFields);
       await userdetails.save();
    }

    console.log('this is the  userdetails:' + userdetails);
    console.log('this is the  user id:' + userdetails[0].id);


    loginDetails.user_id = userdetails[0].id;
    //console.log(response);
    res.status(200).json(loginDetails);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.get_all_brands = function(req, res) {
  Brand.find({}, function(err, brands) {
    if (err) res.send(err);
    res.json(brands);
  });
};

exports.get_brands = function(req, res) {
  var brandID = req.body.brandID;
  Product.find({ brandID: brandID }, function(err, products) {
    if (err) res.send(err);
    res.json(products);
  });
};

//Load Dashboard - App
exports.load_dashboard_data = function(req, res) {
  var json = {};
  var apiKey = req.body.apiKey;
  Category.find({}, function(err, categories) {
    if (err) res.send(err);
    json.categorgies = categories;
    var top_item = "true";
    Brand.find({}, function(err, brands) {
      json.brands = brands;
      Bag.find({ apiKey: apiKey }, function(err, bag) {
        json.bag = bag;

        Product.find({ top_item: "true" })
          .sort({ created_date: -1 })
          .limit(7)
          .exec(function(err, top_products) {
            json.top = top_products;

            Product.find({ trending: "true" })
              .sort({ created_date: -1 })
              .limit(7)
              .exec(function(err, trending) {
                json.trending = trending;
                res.json(json);
              });
          });
      });
    });
  });
};

exports.list_products_cat = function(req, res) {
  var catID = req.body.categoryID;
  Product.find({ category: catID }, function(err, products) {
    if (err) res.send(err);
    res.json(products);
  });
};

exports.create_a_product = function(req, res) {
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
};

exports.view_a_product = function(req, res) {
  Product.findById(req.body.productID, function(err, product) {
    if (err) res.send(err);
    res.json(product);
  });
};

exports.user_products = function(req, res) {
  var userID = req.body.userID;
  Product.find({ user_data: userID }, function(err, products) {
    if (err) res.send(err);
    res.json(products);
  });
};

exports.update_a_product = function(req, res) {
  Product.findOneAndUpdate(
    { _id: req.body.productID },
    req.body,
    { new: true },
    function(err, product) {
      if (err) res.send(err);
      res.json(product);
    }
  );
};

exports.delete_a_product = function(req, res) {
  Product.remove(
    {
      _id: req.params.productID
    },
    function(err, product) {
      if (err) res.send(err);
      res.json({ message: "Product successfully deleted" });
    }
  );
};

//Reviews
exports.add_review = function(req, res) {
  var new_review = new Review(req.body);
  new_review.save(function(err, review) {
    if (err) res.send(err);
    res.json(review);
    //log adding of product
    var new_log = new TransLog({
      log_type: "New Review Entered",
      log_data: req.body.review_body,
      user_data: req.body.user_id,
      data_ref: review._id
    });
    new_log.save(function(err, new_log) {
      if (err) res.send(err);
    });
  });
};

exports.list_reviews = function(req, res) {
  Review.find({ product_id: req.body.productID }, [])
    .sort({ created_date: -1 })
    .limit(10)
    .exec(function(err, review) {
      if (err) res.send(err);
      var count = review.length;
      //var count_obj = [{count: count}];
      //var final = keyword.concat(count_obj);
      res.json(review);
    });
};
//Bag
exports.add_a_bag = function(req, res) {
  var new_bag = new Bag(req.body);
  new_bag.save(function(err, bag) {
    if (err) res.send(err);
    res.json({ bag });
    //log adding of product
    var new_log = new TransLog({
      log_type: "New Bag Created",
      log_data: "Bag Created Successfully for a new user",
      user_data: req.body.apiKey,
      data_ref: bag._id
    });
    new_log.save(function(err, new_log) {
      if (err) res.send(err);
    });
  });
};

exports.view_a_bag = function(req, res) {
  Bag.find({ apiKey: req.body.apiKey }, function(err, bag) {
    if (err) res.send(err);
    res.json(bag);
  });
};

exports.update_bag = function(req, res) {
  Bag.findOneAndUpdate(
    { apiKey: req.body.apiKey },
    req.body,
    { new: true },
    function(err, bag) {
      if (err) res.send(err);
      res.json(bag);
    }
  );
};

const googleMapsClient = require("@google/maps").createClient({
  key: "AIzaSyDiUJ5BCTHX1UG9SbCrcwNYbIxODhg1Fl8"
});

exports.delivery_summary = function(req, res) {
  var apiKey = req.body.apiKey;
  var bag_datas = {};
  Bag.find({ apiKey: apiKey }, function(err, bag) {
    bag_datas = bag;
    const ids = bag.map(bag => items => items.quantity);
    res.json(ids);
    //const product_ids = bag_datas.map(bag_data => bag_data.product_id);
  });
};
