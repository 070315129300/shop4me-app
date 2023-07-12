const express = require('express'),
     router = express.Router(),
     mongoose = require('mongoose'),
    SavedItem = require('../api/models/saved-item')


router.post('/add', (req, res)  =>{

    
    if(req.body.apiKey === '' || req.body.apiKey === undefined || req.body.apiKey === null ){
        return res.status(401).json({error: true, message:'apiKey is required'})
    }
    if(req.body.productId === '' || req.body.productId === undefined || req.body.productId === null ){
        return res.status(401).json({error: true, message:'productId is required'})
    }

    SavedItem.findOne({
        apiKey: req.body.apiKey
    }).then(item =>{
        if(item){
            item.items.push(req.body.productId)
            item.save()
            return res.status(200).json({error: false, message:'Item saved', saveditem: item})

        }else{
            const newSavedItem = new SavedItem({
                apiKey: req.body.apiKey
            })
            .save()
            .then(item =>{
                item.items.push(req.body.productId)
                return res.status(200).json({error: false, message:'Item saved', saveditem: item})
            })
            .catch(err =>{
                return res.status(400).json({error: true, message:'Error saving item'})
                console.log(err)
            })
        }
    })
    .catch(err =>{
        return res.status(400).json({error: true, message:'Error saving item'})
        console.log("error: true", err)
    })
})

router.post('/remove', (req, res) =>{

    if(req.body.apiKey === '' || req.body.apiKey === undefined || req.body.apiKey === null ){
        return res.status(401).json({error: true, message:'apiKey is required'})
    }
    if(req.body.productId === '' || req.body.productId === undefined || req.body.productId === null ){
        return res.status(401).json({error: true, message:'productId is required'})
    }
    
    SavedItem.findOne({apiKey: req.body.apiKey})
    .then(item =>{
        if(item){
            SavedItem.findOneAndUpdate({apiKey: req.body.apiKey}, {$pull:{'items': req.body.productId}},{ new: true })
            .then(item =>{
                return res.status(200).json({error: false,message:"Item removed", saveditem:item})
            })

        }else{
            return res.status(200).json({error: false, message:'You don\'t have a saved item'})
        }
    })
})

router.get('/get/:apiKey', (req, res) =>{
    SavedItem.findOne({apiKey: req.params.apiKey})
    .populate('items')
    .then(saveditem =>{
        return res.status(200).json(saveditem)
    })
    .catch(err =>{
        return res.status(400).json({error: true, message:'Error getting saved item'})
    })
})

module.exports = router;