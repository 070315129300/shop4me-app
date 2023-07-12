const express = require("express");
const router = express.Router();

const upload = require('../middleware/uploadMiddleware');
const Resize = require('../middleware/Resize');
const Promo = require('../api/models/promo-model');
const Product = require('../api/models/product-model');
const path = require("path");


 router.get("/all", async (req, res) => {

  Promo.find({}).sort({date: -1})
  .then(promo =>{
    if(!promo){
      return res.status(404).joson({error: true, message:"No promo found"})
    }else{
      return res.status(200).json(promo)
    }
  }).catch(err =>{
    console.log(err)
    return res.status(500).json({error: true, message:"Error fetching promo"})
  })
});

 router.get("/getAllAvailablePromo", async (req, res) => {

  Promo.find({available: true}).sort({date: -1})
  .then(promo =>{
    if(!promo){
      return res.status(404).joson({error: true, message:"No promo found"})
    }else{
      return res.status(200).json(promo)
    }
  }).catch(err =>{
    return res.status(500).json({error: true, message:"Error fetching promo"})
  })
});


router.post("/addPromo", upload.single('image'), async (req, res) => {
  

  if(!req.body.name){
    return res.status(400).json({error: true, message:"promo name is required"})
  }
    
    let filename;
    const imagePath = path.join(__dirname, '../uploads'); 
    const fileUpload = new Resize(imagePath);
   
    let imageBase =''
    if (req.file || req.file !== undefined) {
      filename = await fileUpload.save(req.file.buffer).then(file => {
        if (file) {
          imageBase= "http://app.shop4me.online/" + file;
        }
      });
    }

    const newPromo = new Promo({
        name: req.body.name,
        default_img:imageBase
    }).save().then(promo =>{
      return res.status(200).json({error: false, message:"promo added", promo})
    }).catch(err =>{
      res.status(400).json({error: true, message:"Error adding promo"})
    })
});

router.post("/updatePromo/:id", upload.single('image'), async (req, res) => {
  

  if(!req.body.name){
    return res.status(400).json({error: true, message:"promo name is required"})
  }
    
    let filename;
    const imagePath = path.join(__dirname, '../uploads'); 
    const fileUpload = new Resize(imagePath);
   
    let imageBase =''
    if (req.file || req.file !== undefined) {
      filename = await fileUpload.save(req.file.buffer).then(file => {
        if (file) {
          imageBase= "http://app.shop4me.online/" + file;
        }
      });
    }

    let promo = await Promo.findOne({_id: req.params.id});
     if(req.body.available === true && !req.file && promo.default_img === ""){
       return res.status(400).json({error: true, message:"update promo image"})
     }

    promo.name = req.body.name ? req.body.name : promo.name
    promo.default_img = req.file ? imageBase : promo.default_img
    promo.available = req.body.available ? req.body.available : promo.available 
    promo.updated_date = Date.now();

    promo.save().then(promo =>{
      return res.status(200).json({error: false, message:"promo updated", promo})
    }).catch(err =>{
      res.status(400).json({error: true, message:"Error updating promo"})
    })
});


router.post('/markForPromo', async (req, res) =>{

  if(!req.body.productId || req.body.productId === ""){
    return res.status(400).json({error: true, message:" productId is required"})
  }

  if(req.body.promoId){

   let promo = await Promo.findOne({_id: req.body.promoId})

   if(!promo){
     return res.status(404).json({error: true, message:"promo not found"})
   }
  }
    let product = await Product.findOne({_id: req.body.productId})
     product.promoID = !req.body.promoId || req.body.promoId === "" ?  null : req.body.promoId
     product.on_promo = !req.body.promoId || req.body.promoId === '' ? false : true
     product.save().then(product =>{
       return res.status(200).json({error: false, message:'product marked for promo', product})
     })
     .catch(err =>{
       return res.status(400).json({error: true, message:"Error marking product form promo"})
     })


})

router.get('/getPromoProducts/:id', (req, res) =>{
  Product.find({on_promo: true, promoID: req.params.id})
  .then(products =>{
    return res.status(200).json({error: false, promo_products: products})
  }).catch(err =>{
    return res.status(400).json({error: true, message:"Error fetching promo products"})
  })
})

module.exports = router;
