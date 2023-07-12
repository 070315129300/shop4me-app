const express = require("express");
const config = require("config");
const router = express.Router();
const ResizeCate = require('../middleware/ResizeCate')
const path = require('path');
const mongoose = require('mongoose');
const Banner =require('../api/models/banner');
const multer = require('multer');
const upload = require('../middleware/uploadMiddleware')
const Resize = require('../middleware/Resize')

let theNewFilename = ''
var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, path.join(__dirname, '../../shop4me-app/uploads'))
    },
    filename: function(req, file, callback) {
       rand=Date.now() + path.extname(file.originalname);
        callback(null, file.fieldname + '-' + rand);
        theNewFilename = file.fieldname + '-' + rand
        console.log('This rand: +++', file.fieldname + '-' + rand)
    }

})

// var upload = multer({storage: storage});



router.post("/addBanner", upload.single('image'), async(req,res) => {



    let filename;
    let imageBase =''
    const imagePath = path.join(__dirname, '../uploads'); 

    const fileUpload = new Resize(imagePath);

    if (req.file || req.file !== undefined) {
        filename = await fileUpload.save(req.file.buffer).then(file => {
          if (file) {
            imageBase= "https://app.shop4me.online/" + file;
          }

          let banner = new Banner({
            hint: req.body.hint,
              url: imageBase
          }).save().then(banner=>{
    
            return res.status(200).json({error: false, banner: banner})
          }).catch(err =>{
              console.log(err)
              return res.status(400).json({error: true, message:"Error adding banner"})
          });
        });
  
  
    }else{
        return res.status(400).json({error: true, message:"File is required"})
    }
  
   

    
   
})

router.get('/getAll', (req, res) =>{
    Banner.find({})
    .then(banner =>{
        if(banner){
            return res.status(200).json({error: false, banner})
        }
    })
    .catch(err =>{
        console.log("ERR: ", err)
        return res.status(400).json({error: true, message:"Error fetching banner"})
        
    })
})

router.post("/updateBanner", upload.single('image'), async(req,res) => {


    let icon = ''
    const imagePath = path.join(__dirname, '../../shop4me-app/uploads'); 
    const fileUpload = new ResizeCate(imagePath);

    Banner.findOne({
        _id: req.body.id
    }).then(caticon =>{
        if(caticon){

        Banner.findOneAndUpdate({_id: req.body.id},{$set:{
        hint: req.body.hint,
        available: req.body.available,
        is_active: req.body.activeStatus,
        url: theNewFilename === null || theNewFilename === '' || theNewFilename === undefined ? caticon.url : "https://app.shop4me.online/" + theNewFilename 
    }})
        .then(updatedItem =>  res.status(200).json({error: false, message:'Item updated successfully', category: updatedItem}))
        .catch(err => res.status(400).json({error: true, message:'Error updating icon'}))
     }
    }).catch(err =>  
        console.log('The result error: ', err)
       // res.status(400).json({error: true, message:'Error Finding category'})
        )
   
})

router.post('/changeStatus', (req, res) =>{

    Banner.findOne({_id: req.body.id})
    .then(banner =>{
        if(banner){
            banner.is_active = req.body.activeStatus,
            banner.hint= req.body.hint
            banner.save().then(() => res.status(200).json({error: false, message:"banner status updated"}))
            .catch(err =>{
                console.log('ERR: ', err)
                return res.status(400).json({error: true, message:"Error updating message"})
            })
        }else{
            return res.status(404).json({error: true, message:"banner not found"})
        }
    }).catch(err =>{
        console.log('ERR: ', err)
        return res.status(400).json({error: true, message:"error updating status"})
    })
})


router.post('/deleteBanner/:id',(req, res) =>{
    Banner.findOneAndRemove({_id: req.params.id})
    .then(item =>{
        return res.status(200).json({error: false, message:'banner deleted'})
    })
    .catch(err =>{
        return res.status(400).json({error: true, message:'Error deleting banner'})
    })
})
router.get('/getActiveBanner', (req, res) =>{
    Banner.findOne({is_active: true})
    .then(banner =>{
        return res.status(200).json({error: false, banner})
    })
    .catch(err =>{
        return res.status(400).json({error: true, message:"Error getting active banner"})
    })
})


module.exports = router;
