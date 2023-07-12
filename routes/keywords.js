const express = require("express");
const config = require("config");
const router = express.Router();
const mongoose = require('mongoose')
 const Keywords = mongoose.model('Keyword');
var Product = mongoose.model("Product");


router.post('/add', (req, res) =>{
    let newkeyword = req.body.keyword.replace(/\s/g, '');

    console.log('Expected keyword: ', newkeyword)
    
    if(req.body.keyword.trim() === null ||  req.body.keyword.trim() ==='' || req.body.keyword.trim() === undefined){
        res.status(400).json({error: true, message:'You can not add empty parameter'})
    }
    else{
    Keywords.findOne({keyword: newkeyword})
    .then(keyword =>{
        if(!keyword){
            let newKeyword = new Keywords({
                keyword: newkeyword
            }).save().then(keyw =>res.status(200).json({error: false, message: 'keyword added successfully'}))
        }else{
            console.log('already saved')
        }
    })}
})

router.get('/all', (req, res) =>{
    Keywords.find({})
    .then(kword =>{
        res.status(200).json({error: false, keyword:kword})
    })
})

router.get('/total', (req, res) =>{
    Keywords.find({keyword: req.body.keyword}).count().then(count =>{
        if(count){
            res.status(200).json({error: false, count})
        }
    })
})

 router.post('/search', (req, res) =>{

let limit = parseInt(req.body.limit);
let skip = (parseInt(req.body.page)-1) * parseInt(limit);
console.log('search:',req.body.searchquery)
    
//  Product.findOne(
//     //  {"name": new RegExp('^'+ req.body.searchquery+'$', "i")}
//         { "name": { "$regex": req.body.searchquery, "$options": "i" } }
//     )
    // .limit(limit)
    //         .skip(skip)
//             .then(post => {
//             if (post) {
//                 res.status(200).json({error: false, message:post})
//             }
//         })  

        Product.find({ "name": { "$regex": req.body.searchquery, "$options": "i" }, available: true })
            .limit(limit)
            .skip(skip).
            populate('user').then(products =>{
            if(products){
             res.status(200).json({error: false, message: products})
            }
        }).catch(err =>{
            console.log(err)
            res.status(400).json({error: true, message:err})
        })
 })


router.post('/find/:kname', (req, res) =>{

     var pageOptions = {
    page: req.query.page || 0,
    limit: req.query.limit || 10
}

 Keywords.findOneAndUpdate({keyword: req.params.kname }, { $inc: { hits: 1 } }, { new: true }).then(() =>{
     Keywords.find({keyword: req.params.kname})
    .skip(pageOptions.page*pageOptions.limit)
    .limit(pageOptions.limit)
    .exec(function (err, doc) {
        if(err) { res.status(500).json(err); return; };
        res.status(200).json(doc);
    })
 })


    // Keywords.find({keyword: req.params.kname})
    // .then(keyword =>{
    //     if(keyword){
    //         res.status(200).json({error: false,keyword })
    //     }
    // })
})

module.exports = router;