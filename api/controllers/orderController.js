'use strict';


var mongoose = require('mongoose');
  var TransLog = mongoose.model('Trans');
  var Order = mongoose.model('Order');

exports.list_all_orders = 
function(req, res) {
  Order.find({}, function(err, orders) {
    if (err)
      res.send(err);
    res.json(orders);
  });
};


exports.create_order = function(req, res) {
  var new_order = new Order(req.body);
  new_order.save(function(err, order) {
    if (err)
      res.send(err);
    res.json({order});
    //log adding of order
    var new_log = new TransLog({log_type: 'New Order Created', log_data: order.order_id, user_data: req.body.user_data, data_ref: product._id});
    new_log.save(function(err, new_log){if (err) res.send(err);});

  });
};

exports.view_an_order = function(req, res) {
  Order.findById(req.body.orderID, function(err, order) {
    if (err)
      res.send(err);
    res.json(order);
  });
};


exports.update_an_order = function(req, res) {
  Order.findOneAndUpdate({_id: req.body.orderID}, req.body, {new: true}, function(err, order) {
    if (err)
      res.send(err);
    res.json(order);
  });
};


exports.remove_an_order = function(req, res) {


  Order.remove({
    _id: req.params.orderID
  }, function(err, order) {
    if (err)
      res.send(err);
    res.json({ message: 'Order successfully removed' });
  });
};
