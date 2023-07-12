const express = require("express");
const config = require("config");
const router = express.Router();
//const upload = require('../middleware/uploadMiddleware')
const ResizeCate = require('../middleware/ResizeCate')
const path = require('path');
const mongoose = require('mongoose');
const Category = mongoose.model('Category');
const multer = require('multer');

let theNewFilename = ''
var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, path.join(__dirname, '../../shop4me-app/uploads'))
    },
    filename: function(req, file, callback) {
        //callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
                //callback(null, file.originalname)
        rand=Date.now() + path.extname(file.originalname);

        callback(null, file.fieldname + '-' + rand);

        theNewFilename = file.fieldname + '-' + rand

        console.log('This rand: +++', file.fieldname + '-' + rand)

    }

})

var upload = multer({
    storage: storage});



router.post("/addCategory", upload.single('image'), async(req,res) => {

    console.log('The category body:', req.body)
    let icon = ''
    const imagePath = path.join(__dirname, '../../shop4me-app/uploads'); 
    const fileUpload = new ResizeCate(imagePath);
      let category = new Category({
          name: req.body.name,
          icon: "https://app.shop4me.online/" + theNewFilename 
      }).save().then(category=>{

        return res.status(200).json({error: false, category: category})
      });
   
})

router.post("/updateCategory", upload.single('image'), async(req,res) => {


    let icon = ''
    const imagePath = path.join(__dirname, '../../shop4me-app/uploads'); 
    const fileUpload = new ResizeCate(imagePath);

    Category.findOne({
        _id: req.body.id
    }).then(caticon =>{
        if(caticon){

        Category.findOneAndUpdate({_id: req.body.id},{$set:{
        name: req.body.name,
        available: req.body.available,
        icon: theNewFilename === null || theNewFilename === '' || theNewFilename === undefined ? caticon.icon : "https://app.shop4me.online/" + theNewFilename 
    }})
        .then(updatedItem =>  res.status(200).json({error: false, message:'Item updated successfully', category: updatedItem}))
        .catch(err => res.status(400).json({error: true, message:'Error updating icon'}))
     }
    }).catch(err =>  
        console.log('The result error: ', err)
       // res.status(400).json({error: true, message:'Error Finding category'})
        )
   
})


router.post('/deleteCategory/:id',(req, res) =>{
    Category.findOneAndRemove({_id: req.params.id})
    .then(item =>{
        return res.status(200).json({error: false, message:'Item deleted'})
    })
    .catch(err =>{
        return res.status(400).json({error: true, message:'Error deleting item'})
    })
})

router.get('/getAll', (req, res) =>{
    Category.find({})
    .then(categories =>{
        if(categories){
            return res.status(200).json({error: false, categories})
        }
    })
    .catch(err =>{
        console.log("ERR: ", err)
        return res.status(400).json({error: true, message:"Error fetching categories"})
        
    })
})
module.exports = router;
