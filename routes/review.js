const express = require("express");
const config = require("config");
const router = express.Router();
const mongoose = require('mongoose')
 const Reviews = mongoose.model('Review');
var Product = mongoose.model("Product");


router.post('/add', (req, res) =>{

    
    if(req.body.apiKey === null ||  req.body.apiKey ==='' || req.body.apiKey === undefined){
        res.status(400).json({error: true, message:'apiKey is required'})
    }
    if(req.body.productId === null ||  req.body.productId ==='' || req.body.productId === undefined){
        res.status(400).json({error: true, message:'productId is required'})
    }
    if(req.body.remarks === null ||  req.body.remarks ==='' || req.body.remarks === undefined){
        res.status(400).json({error: true, message:'remarks is required'})
    }
    if(req.body.rating === null ||  req.body.rating ==='' || req.body.rating === undefined){
        res.status(400).json({error: true, message:'rating is required'})
    }
    else{

        let newReview = new Reviews({
            apiKey: req.body.apiKey,
            product: req.body.productId,
            remarks: req.body.remarks,
            rating: req.body.rating,
            name: req.body.name
        }).save().then(review =>{
            return res.status(200).json({error: false, message: 'Review Added', review:review})
        }).catch(err =>{
            return res.status(401).json({error: true, message:'Error adding review'})
        })
    }
})

router.get('/all', (req, res) =>{
    Reviews.find({})
    .then(reviews =>{
        res.status(200).json({error: false, reviews:reviews})
    }).catch(err =>{
        return res.status(401).json({error: true, message:'Error fetching all review'})
    })
})

router.delete('/:id/:apikey', (req, res) =>{

    if(req.params.id === null ||  req.params.id === '' || req.params.id === undefined){
        res.status(400).json({error: true, message:'id is required'})
    }
    Reviews.findOne({_id: req.params.id})
    .then(item =>{
        if(!item){
            return res.status(401).json({error: true, message:'This review is not found'})
        }
        if(item.apiKey !== req.params.apikey){
            return res.status(401).json({error: true, message:'You are not authorized to delete this review'})
        }
            Reviews.findOneAndRemove({
            _id: req.params.id
            }).then(review =>{
            return res.status(200).json({error: false, message:'review Deleted', review: review})
            })
            .catch(err =>{
            return res.status(400).json({error: true, message:'Error deleting review'})
            })
    })

    
})

router.get('/:id', (req, res) =>{
    Reviews.findOne({_id: req.params.id})
    .then(reviews =>{
        res.status(200).json({error: false, reviews:reviews})
    }).catch(err =>{
        return res.status(401).json({error: true, message:'Error fetching review'})
    })
})

router.post('/update', (req, res) =>{

    if(req.body.apiKey === null ||  req.body.apiKey ==='' || req.body.apiKey === undefined){
        res.status(400).json({error: true, message:'apiKey is required'})
    }
    if(req.body.reviewId === null ||  req.body.reviewId ==='' || req.body.reviewId === undefined){
        res.status(400).json({error: true, message:'reviewId is required'})
    }
    if(req.body.remarks === null ||  req.body.remarks ==='' || req.body.remarks === undefined){
        res.status(400).json({error: true, message:'remarks is required'})
    }
    if(req.body.rating === null ||  req.body.rating ==='' || req.body.rating === undefined){
        res.status(400).json({error: true, message:'rating is required'})
    }

    Reviews.findOneAndUpdate({_id: req.body.reviewId, apiKey: req.body.apiKey},{$set:{
            remarks: req.body.remarks,
            rating: req.body.rating
    }})
    .then(review =>{
        return res.status(200).json({error:false, message:'Review updated', review:review})
    })
    .catch(err =>{
        return res.status(401).json({error: true, message:'Error updating review'})
    })
   
})


//  Reviews.findOneAndUpdate({keyword: req.params.kname }, { $inc: { hits: 1 } }, { new: true }).then(() =>{
//      Reviews.find({keyword: req.params.kname})
//     .skip(pageOptions.page*pageOptions.limit)
//     .limit(pageOptions.limit)
//     .exec(function (err, doc) {
//         if(err) { res.status(500).json(err); return; };
//         res.status(200).json(doc);
//     })
//  })

// })

module.exports = router;