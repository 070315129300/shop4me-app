const express = require("express");
const config = require("config");
const router = express.Router();
const authe = require("../middleware/auth");

var mongoose = require("mongoose");
var Product = mongoose.model("Product");
var TransLog = mongoose.model("Trans");
const upload = require('../middleware/uploadMiddleware')
const Resize = require('../middleware/Resize')
var path = require("path")



router.post("/:id", upload.single('image'), async (req, res) => {
  try {

    if (!req.get("Authorization")) {
      return res.status(401).json({ msg: "Unauthorized access" });
    }
    
    console.log(req.params.id)
    let product = await Product.findOne({ _id: req.params.id });

    if (!product) {
        return res.status(404).json({ msg: "Product not found" });

    } 

    console.log('its using my new route for updating')
    //destructure the incoming request body parameters

    let filename;
    const imagePath = path.join(__dirname, '../../shop4me-app/uploads'); 
    const fileUpload = new Resize(imagePath);
        console.log('>>>>>>>>>>>>>> 1'+ Object.keys(req.body))
   // console.log('>>>>>>>>>>>>>> 1'+ JSON.stringify(req.file)) 
     
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
      delivery_channel,
      user_data,
      default_img,
      // images
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
    if (delivery_channel) productFields.delivery_channel = delivery_channel;
    if (user_data) productFields.user_data = req.get("Authorization");
    if (default_img) productFields.default_img = default_img;
    if (req.file || req.file !== undefined) {
      filename = await fileUpload.save(req.file.buffer).then(file => {
        if (file) {
          productFields.images= "http://157.230.229.73/html/shopeasyApi/uploads/" + file
        }


      });
          console.log('>>>>>>>>>>>>>> 2'+ filename)

 
    }

    //Update
    productnew = await Product.findOneAndUpdate(
        { _id: req.params.id },
        { $set: productFields },
        { new: true }
      );
      res.json(productnew);
  } catch (err) {
    console.error(err);
    res.status(500).json("Server error");
  }
});


module.exports = router;
