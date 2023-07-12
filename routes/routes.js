"use strict";
module.exports = function(app) {
  var productList = require("../controllers/productController");
  var keywordList = require("../controllers/keywordController");
  var categoryList = require("../controllers/categoryController");
  var orderList = require("../controllers/orderController");
  var easypayLog = require("../controllers/easypayController");
  var auth = require("../controllers/authController");
  var multer = require("multer");
  var authe = require("../../middleware/auth");

  var mongoose = require("mongoose");
  var Product = mongoose.model("Product");

  // Authentication routes
  app.route("/register").post(auth.register);

  app.route("/login").post(auth.login);

  //app.route("/products_auth", authe).get(productList.all_product_auth);

  app.route("products_auth").get(authe, async (req, res) => {
    try {
      console.log("this should return" + req.vendor);
      const products = await Product.find({ vendor: req.user.id });

      if (!products) return res.json("No products found for this user");

      res.json(products);
    } catch (err) {
      console.error(err);
      res.status(500).json("Server error");
    }
  });

  app.route("/get_keywords").get(keywordList.list_keywords);

  app.route("/new_keyword").post(keywordList.add_a_keyword);

  app.route("/get_count").post(keywordList.get_count);

  app.route("/find_keyword").post(keywordList.find_keyword);

  app.route("/find_where").post(keywordList.find_where);

  //Review Routes
  app.route("/add_review").post(productList.add_review);
  app.route("/view_reviews").post(productList.list_reviews);

  // Product Routes
  app
    .route("/products")
    .get(productList.list_all_products)
    .post(productList.view_a_product);

  app
    .route("/user_products")
    //.get(productList.list_all_products)
    .post(productList.user_products);

  app.route("/dashboard").post(productList.load_dashboard_data);

  app.route("/add_brand").post(productList.add_brand);

  app
    .route("/get_brands")
    .post(productList.get_brands)
    .get(productList.get_all_brands);

  app.route("/new_product", authe).post(upload.single('file'),productList.create_a_product);

  app.route("/get_product_cat").post(productList.list_products_cat);

  app
    .route("/update_product")
    .put(productList.update_a_product)
    .delete(productList.delete_a_product);

  app
    .route("/get_categories")
    .get(categoryList.list_all_categories)
    .post(categoryList.get_category_products);

  app.route("/new_category").post(categoryList.add_a_category);

  //Bag routes
  app.route("/view_bag").post(productList.view_a_bag);

  app.route("/add_bag").post(productList.add_a_bag);

  app.route("/update_bag").post(productList.update_bag);

  //Distance - Google Maps
  app.route("/delivery_summary").post(productList.delivery_summary);

  //Place order -- Shopeasy
  app.route("/create_order").post(orderList.create_order);
  //Easypay
  app.route("/log_payment").post(easypayLog.log_payment);
};
