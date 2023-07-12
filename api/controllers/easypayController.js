'use strict';


var mongoose = require('mongoose');
var Easypay = mongoose.model('Easypay');



exports.log_payment = function(req, res) {
    var new_payment = new Easypay(req.body);
    new_payment.save(function(err, payment) {
      if (err)
        res.send(err);
        res.json({ message: 'Log created successfully', error: false });
    });
  };