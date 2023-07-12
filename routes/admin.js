const express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    Admin = require('../api/models/admin'),
    querystring = require("querystring"),
    bcrypt = require('bcryptjs');
    axios = require("axios");



     
router.post('/addAdmin', (req, res) =>{


    Admin.findOne({email : req.body.email})
    .then(admin =>{
        if(admin){
            console.log('===>', admin)

            return res.status(400).json({error: false, message:'Email already exist'})
        }else{
             const newAdmin ={
                 email: req.body.email,
                 name: req.body.name,
                 password: req.body.password
             }
            bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newAdmin.password, salt, (err, hash) => {
            if (err) throw err;
            newAdmin.password = hash;
            let userInstance = new Admin(newAdmin);

            userInstance.save().then(() => {
            res.status(200).json({ error: false, message: 'Admin registered successfully' })

            })
            .catch(err => res.status(400).json({ error: err }))
                    
         });
    
        });
    }
    })
    .catch(err =>{
            console.log('Error: ', err.message)
    })
   
})

router.post('/adminlogin', async (req, res) => {

    Admin.findOne({email: req.body.email})
    .then(admin =>{
        if(admin){
            bcrypt.compare(req.body.password, admin.password)
            .then(match =>{
                if(match){
                    return res.status(200).json({error: false, message:'Login successful', user: admin})
                }else{
                    return res.status(400).json({error: true, message:"Either email or password is incorrect"})
                }
            })
            .catch(err =>{
                console.log('Error: ',err.message)
            })
        }else{
            return res.status(401).json({error: true, message:"Either email or password is incorrect"})
        }

    })
    .catch(err =>{
        return res.status(400).json({error: true, message:'Error login in'})
    })
   
})

module.exports = router;
