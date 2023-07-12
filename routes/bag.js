const express = require('express'),
     router = express.Router(),
     mongoose = require('mongoose'),
     BagItem = mongoose.model('BagItem'),
     Order = mongoose.model('Order'),
     querystring = require("querystring"),
     axios = require("axios"),
     Product = mongoose.model("Product");
    Bag = mongoose.model("Bag");
    var mysql = require('mysql'),
   sendEmail  = require('../api/helpers/helper')




    var con = mysql.createConnection({
        host: "137.184.151.18",
        port: '3306',
        user: "root",
        password: "xccihehc",
        database: 'fudi' 
    });
    


    // const BASEURL = 'easydispatch.ng';
const BASEURL = 'easy.everythingeasy.ng';
const BASEURL2 = 'https://user.shop4me.online/api';


router.post('/changeBagItem',(req, res) =>{
    BagItem.findOne({_id: req.body.bagItem})
    .then(bagItem =>{
        if(bagItem){
            bagItem.quantity = parseInt(req.body.quantity)
            bagItem.save()
            .then(item =>{
                return res.status(200).json({error: false, message:"BagItem updated"})
            }).catch(err =>{
                return res.status(400).json({error: true, message:"error updating bagitem"})
            })
        }else{
            return res.status(404).json({error: true, message:"Bagitem item not found"})
        }
    })
    .catch(err =>{
        return res.status(400).json({error: true, message:"Error fetching bag item"})
    })
})
    
router.get('/getBag/:apiKey', async (req, res) => {

    Bag.findOne({apiKey: req.params.apiKey, paid:'No'})
    .populate([{
        path:'bagitem', 
        populate: {
            path:'product', populate:{
           path:'category_id',
       }
   },
        
    }])
    .then(bag =>{
        let itemquantity =[]

        if(bag){
            for( let item of bag.bagitem){
                Product.findOne({_id: item.product._id}).select('_id quantity')
               .then(item2 =>{
                   itemquantity.push(item2)
               }).catch( err =>{
                   console.log("Error: ", err)
                   return res.status(400).json({error: true, message:"Product not found"})
               })
            }
            setTimeout(() => {  
            return res.status(200).json({error: false, bag:bag, quantity: itemquantity})
                //    console.log('This quantity: ',  itemquantity)
            }, 1000);


        }else{
            return res.status(200).json({error: false, message:'Bag is empty'})
        }
       // console.log('Bag: ', bag)
    })
    .catch(err =>{
        console.log('Bag err: ', err) 
        return res.status(400).json({error: true, message:"Error loading bag"})
    })
})

const createBagItem = (id, apiKey) => {
    return new Promise((resolve, reject) =>{

        BagItem.findOne({
            apiKey:apiKey,
             product: id,
            check_out: false
        }).then(bag =>{
            console.log('The bag: ',bag)
            if(bag === null){

                const newBagitem= new BagItem({
                    apiKey:apiKey,
                    product: id
                }).save()
                .then(item =>{
                   resolve(item)
                    console.log('We are done')
                })
                .catch(err =>{
                    reject(err)
                    console.log('Item added to bag')
                })

            }else{

                reject(100)

            }
           
        })

   
    })
   
}


router.post('/addTobag', (req, res) =>{
    
    if(req.body.apiKey === '' || req.body.apiKey === undefined || req.body.apiKey === null ){
        return res.status(401).json({error: true, message:'apiKey is required'})
    }
    if(req.body.productId === '' || req.body.productId === undefined || req.body.productId === null ){
        return res.status(401).json({error: true, message:'productId is required'})
    }

    // BagItem.findOne({apiKey: req.body.apiKey, product: req.body.productId})
    // .then(bagItem =>{
    
    //     if(bagItem.check_out !== true){
    //         return res.status(400).json({error: true, message:'Item already exist in bag'})   
    //     }else{
            createBagItem(req.body.productId, req.body.apiKey )
            .then(item =>{
                Bag.findOne({apiKey: req.body.apiKey, new: true})
                .then(bag =>{
                    if(bag){
                        bag.bagitem.push(item._id)
                        bag.save()
                        return res.status(200).json({error: false, message:'Item added to bag'})
                    }else{
                        const newBag = new Bag({
                            apiKey: req.body.apiKey,
                        }).save()
                        .then(bag =>{
                            bag.bagitem.push(item._id)
                            bag.save()
                            return res.status(200).json({error: false, message:'Item added to bag'})
                        })
                        .catch(err =>{
                            console.log('error pushing to bag: ', err)
                        })
                    }
                })
            })
            .catch(err =>{
                if( err === 100){
                    return res.status(401).json({error: true, message:'Item already exist in bag'})
                    console.log('There is issue: ', 100)

                }else{
                    console.log('error while adding')
                    res.status(400).json({error: true, message:'An error occurred while adding to cart'})
                }
            })
   
})

router.post('/removeItem',(req, res) =>{

    if(req.body.apiKey === '' || req.body.apiKey === undefined || req.body.apiKey === null ){
        return res.status(401).json({error: true, message:'apiKey is required'})
    }
    if(req.body.productId === '' || req.body.productId === undefined || req.body.productId === null ){
        return res.status(401).json({error: true, message:'productId is required'})
    }

    Bag.findOne({apiKey: req.body.apiKey})
    .then(bag =>{
        if(bag){
            Bag.findOneAndUpdate({apiKey: req.body.apiKey}, {$pull:{'bagitem': req.body.productId}},{ new: true }, )
            .then(item =>{

                 BagItem.findOneAndRemove({apiKey: req.body.apiKey, product: req.body.productId})
                .then(item =>{
                    console.log('BAg', item)

                    if(item){
                        return res.status(200).json({error: false, message:'Item removed successfully'})
                    } else{
                       // console.log('Problem removing itemn')
                       return res.status(400).json({error: true, message:'Item does not seem to exist in bag'})
                    }
                })  
            })
            .catch(err => {return res.status(400).json({error: true, message:'Error removing item from catch'})})

        } else{
            return res.status(404).json({error: true, message:'Bag does not exist'})
        }
    })
    .catch(err =>{
        return res.status(400).json({error: true, message:'An error occurred while removing item'})
    })
    
})

router.post('/checkout',async (req, res) =>{
    req.body.address === '' || req.body.address === undefined || req.body.address === null ? 
     res.status(401).json({error: true, message:'Address is required'}): req.body.address;


     console.log('**************MMMMMMM*****************', req.body)

     let isBagExisting = await Bag.findOne({_id: req.body.bagId})
     if(!isBagExisting){
        return res.status(404).json({error: true, message:"Bag not found"})
    }
    

    Bag.findOneAndUpdate({
        _id: req.body.bagId},{$set:{
         bag_address: req.body.address,
         total_amount: parseFloat(req.body.totalItemPrice),
         dispatch_amount: req.body.dispatchPrice
        }
    }).then(item =>{
             if(item){
                    
                    for(let i of item.bagitem){

                        BagItem.findOneAndUpdate({_id: i},{$set:{
                            check_out: true
                        }}).then(item =>{
                            //Reduce the quantity here
                        })
                    }
             }
       
        changeBagStatus(req.body.bagId)
        .then(bag =>{

            transportationCost(
                item.lat,
                item.lon,
                req.body.receiverLat,
                req.body.receiverLong,
                item.apiKey,
                item.lon, 
                item.lat,
                req.body.customerPhone,
                req.body.customerName,
                req.body.customerEmail,
                req.body.address,
                req.body.dispatchPrice,
                item
            )
                .then(joborder =>{
                
                    console.log('=+=', joborder.job_id)
                    createOrder(item.apiKey,req.body.totalItemPrice,req.body.paymentMethod, req.body.address,
                    req.body.customerName,req.body.customerPhone,req.body.cardDetails,
                    req.body.receiverLat,req.body.receiverLong,req.body.customerEmail,req.body.bagId, joborder.job_id)
                    .then(order =>{
                        console.log('The success message: ', order._id)
                        sendEmail(req, res,req.body.customerName, req.body.customerEmail, 'hello@shop4me.online','Notice of Order', 'order_on_its_way.handlebars',req.body.address,'picked',req.body.paymentMethod,req.body.totalItemPrice, order._id)
                    })
                    .catch(err =>{
                    console.log('Error: error creating order', err)
                    })
                    return res.status(200).json({error: false, bag: bag, jobdetails: joborder})

                })
                .catch(err =>{
                    console.log('job order error: ', err)
                })
            

            
        })
        .catch(err =>{
            console.log("The error: ", err)
            return res.status(401).json({error: true, message:' An error occurred'})
        })
    }).catch(err =>{
        return res.status(400).json({error: true, message:"Bag does not exist"})
    })
})




const changeBagStatus =(bagId) =>{
    return new Promise((resolve, reject) =>{
          Bag.findOneAndUpdate({_id: bagId},{$set:{
        new: false,
        paid:'Yes'
     }}).then(item  =>{
         console.log('The way it works')
         resolve(item)
     }).catch(err =>{
         reject(err)
     })
    })
}


const createOrder =(apiKey,orderTotal,paymentMethod, deliveryAddress, customerName,
    customerPhone, cardDetails,receiverLat,receiverLong,customerEmail, bagItem,job_id) =>{

    let orderId = Date.now()
    return new Promise((resolve, reject) =>{
        let newOrder = new Order({
                apiKey: apiKey,
                order_id: orderId,
                order_total:orderTotal,
                payment_method:paymentMethod,
                delivery_address: deliveryAddress,
                customer_name:customerName,
                customer_mobile:customerPhone,
                card_details:cardDetails,
                receiver_lat:receiverLat,
                receiver_long:receiverLong,
                customer_email:customerEmail,
                bag:bagItem,
                paid: true,
                job_id:job_id

            }).save().then(order =>{
                resolve(order)
            })
            .catch(err =>{
                // console.log('The error i gat: ', err)
                reject(err)
            })
        })
    
}



const transportationCost =(orderlatitude, orderlongitude,destinationlatitude, 
                destinationlongitude,mainreq,productLong, productLat,
                customerPhone,name,email,address,delivery_cost, item) =>{


        let routeCost =0;
        let dataobject = querystring.stringify({
                lat1: orderlatitude,
                long1: orderlongitude,
                lat2: destinationlatitude,
                long2: destinationlongitude

        })

        console.log('==main req: ',mainreq)
        console.log('==data : ',dataobject)
  
        return new Promise((resolve, reject) =>{
  
      let thisDistance=0;
  
      return axios.post("https://user.shop4me.online/dagpayment/distance.php",
      dataobject, {
          headers: {
          'Content-Type': 'application/x-www-form-urlencoded',  }
      }).then(response =>{
  
        if(response.data){
  
          thisDistance = response.data.data
          var data2 = querystring.stringify({ 
          distance: parseFloat(response.data.data)
          });
  
  
          var header = querystring.stringify({ 
          'authorization': mainreq,
          'Content-Type': 'application/x-www-form-urlencoded',
          });
  
  
                  let pairRiderData={}
                  pairRiderData.longitude  =  '3.4288669',
                //   pairRiderData.longitude  =  orderlongitude,
                //   pairRiderData.latitude   =  orderlatitude,
                  pairRiderData.latitude   =  '6.4546073',
                  pairRiderData.dlongitude =  destinationlongitude,
                  pairRiderData.dlatitude  =  destinationlatitude,
                  pairRiderData.is_express =  'yes',
                  pairRiderData.paid       =  'yes'
  
                 
  
                    let configs = { headers: {'authorization': mainreq} };
  
                  
                //   return axios.post('https://getshopeasy.com/api/v3/pair_riders',pairRiderData, configs)
                  return axios.post(`${BASEURL2}/v3/pair_riders`,pairRiderData, configs)
                  .then(response => { 
  
                      if(response){
                          var scheduleJobData = querystring.stringify({
                          quantity: 1,
                          origin: '29b Afolabi Aina, Ikeja, Lagos',
                          destination: address,
                          prodname: 'Shop4Me',
                          vehicletype: 'Motocycle',
                          is_express: 'no',//'change this to yes',
                          delivery_note: '',
                          distance:thisDistance,
                          price:delivery_cost,
                          longitude: '3.350235',
                          latitude: '6.607102',
                          dlongitude:destinationlongitude,//3.3514863,
                          dlatitude: destinationlatitude,//6.601838,
                          rphone: customerPhone,
                          rname: name,
                          sname: 'Shop4Me',
                          sphone: '',
                          is_requester:'receiver',
                          escrowprice: 0,
                          escrowcode:0, 
                          escrow:0,
                          payment_method: 'card',//'wallet',
                          remail: email,
                          pay_ondelivery: 0,
                          paid: 'yes',
                         payment_ext : 'yes'
  
                        })

                 

                         
                      return axios.post(`${BASEURL2}/v3/new_job_lidstore`,scheduleJobData, configs)
                      .then(response => {  
                            if(response){
                                resolve(response.data)
                            }
                            else {
                                    
                                console.log('???????????++ no response')
                            }


                            //Decrement item here
                            if(item){
                    
                                for(let i of item.bagitem){
            
                                    BagItem.findOne({_id: i})
                                    .then(item =>{
                                        if(item){
                                            console.log('==', item)
                                            Product.findOne({_id: item.product})
                                            .then(product =>{
                                                if(product){
                                                    let quantity = parseInt(product.quantity)
                                                    let nq = quantity > 1 ? (quantity - 1) : 0
                                                    product.quantity = " " + nq
                                                   product.save()
                                                }
                                            }).catch(err =>{
                                                console.log('ERR: ', err)
                                            })
                                        }
                                    }).catch(err =>{
                                        console.log('ERR: ', err)
                                    })
    
                                    
                                }
                         }
  
                      })
                      .catch(err =>{
                          reject(101)
                        console.log(err.response)
                      return res.status(401).json(err.response.data)
  
                      })
  
  
                              
                  }        // let responses = response.data
  
                  }).catch(err =>{
                      reject(102)
                  console.log('Error: ', err)
                  })
                      
                     
        }else{
              console.log('Error getting the distance')
              return reject(err)
        }
    
      })
      .catch(err => {
        console.log('Catcheeey: ', err)
        return reject(err)
  
      })
       
    })
    
  }


module.exports = router;
