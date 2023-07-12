'use strict';


var mongoose = require('mongoose'),
  path = require('path'),
  Product = mongoose.model('Product'),
  Category = mongoose.model('Category');
  const Resize = require('../../middleware/Resize');


  exports.list_all_categories = function(req, res) {
    // Category.find({}, function(err, category) {
    //     if (err)
    //     res.send(err);
    //   res.json(category);
    // });
    Category.find({}).sort({created_date: -1}).then(cate =>{
      if(cate){
        res.send(cate)
      }
    }).catch(err =>{
      console.log('ZError:', err)
    })
  };

  exports.get_category_products = 
function(req, res) {
  var categoryID = req.body.categoryID;

  Product.find({'category_id': categoryID, available: true,sold: false })
  .populate('user')
  .populate([
      {
        path: 'category_id'}
    ])
  .populate('brandID')
  .then(products =>{
    if(products){
      res.json(products)
    }
  })
  .catch(err =>{
    res.send(err)
  })
  // Product.find({'categoryID' : categoryID}, function (err, products) {
  //   if (err)
  //     res.send(err);
  //   res.json(products);
  // });
};
 
  exports.add_a_category = async function(req, res) {
    console.log('The Category body: ', req.file)
  let filename;
  const imagePath = path.join(__dirname, '../../uplaods'); 
  const fileUpload = new Resize(imagePath);

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
    var new_category = new Category(req.body);
        new_category.save(function(err, category) {
      if (err)
        res.send(err);
        res.json(category); 
    });
  };
