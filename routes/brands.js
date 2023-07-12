const express = require('express'),
     router = express.Router(),
     mongoose = require('mongoose'),
    Brand = mongoose.model("Brand");
    const path = require('path');
const ResizeCate = require('../middleware/ResizeCate');

const multer = require('multer');

let theNewFilename = ''
var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, path.join(__dirname, '../../shop4me-app/uploads/brands'))
    },
    filename: function(req, file, callback) {
        rand=Date.now() + path.extname(file.originalname);

        callback(null, file.fieldname + '-' + rand);

        theNewFilename = file.fieldname + '-' + rand

        console.log('This rand: +++', file.fieldname + '-' + rand)

    }

})

var upload = multer({
    storage: storage});



router.post("/addBrand", upload.single('image'), async(req,res) => {

    console.log('The Brand body:', req.body)
    let icon = ''
    const imagePath = path.join(__dirname, '../../shop4me-app/uploads/brands'); 
    const fileUpload = new ResizeCate(imagePath);
      let brand = new Brand({
          name: req.body.name,
          icon: "https://app.shop4me.online/" + theNewFilename 
      }).save().then(brand=>{

        return res.status(200).json({error: false, brand: brand})
      });
   
})

router.post("/updateBrand", upload.single('image'), async(req,res) => {


    let icon = ''
    const imagePath = path.join(__dirname, '../../shop4me-app/uploads'); 
    const fileUpload = new ResizeCate(imagePath);

    Brand.findOne({
        _id: req.body.id
    }).then(caticon =>{
        if(caticon){

        Brand.findOneAndUpdate({_id: req.body.id},{$set:{
        name: req.body.name,
        available: req.body.available,
        icon: theNewFilename === null || theNewFilename === '' || theNewFilename === undefined ? caticon.icon : "https://app.shop4me.online/" + theNewFilename 
    }})
        .then(updatedItem =>  res.status(200).json({error: false, message:'Item updated successfully', brand: updatedItem}))
        .catch(err => res.status(400).json({error: true, message:'Error updating icon'}))
     }
    }).catch(err =>  
        console.log('The result error: ', err)
       // res.status(400).json({error: true, message:'Error Finding category'})
        )
   
})


router.post('/deleteBrand/:id',(req, res) =>{
    Brand.findOneAndRemove({_id: req.params.id})
    .then(item =>{
        return res.status(200).json({error: false, message:'Item deleted'})
    })
    .catch(err =>{
        return res.status(400).json({error: true, message:'Error deleting item'})
    })
})

router.get('/fetchAllBrands', (req, res) =>{
    Brand.find({})
    .sort({created_date: -1})
    .then(brands =>{
        if(brands){
            return res.status(200).json({error: false, brands:brands})
        }
    })
})

module.exports = router;
