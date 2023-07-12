'use strict';


var mongoose = require('mongoose'),
  Keywords = mongoose.model('Keyword');

  /*exports.list_keywords = function(req, res) {
    Keywords.find({}, function(err, keyword) {
        if (err)
        res.send(err);
      res.json(keyword);
    });
  };*/

  exports.list_keywords = function(req, res) {
    Keywords.find({},["_id", "keyword"]).sort({Created_date: -1}).limit(3).exec( function(err, keyword) {
        if (err)
        res.send(err);
        var count = keyword.length;
        //var count_obj = [{count: count}];
        //var final = keyword.concat(count_obj);
        res.json(keyword);
    });
  };

  exports.find_where = function(req, res) {
    var word = req.body.word;
    Keywords.find({'keyword' : new RegExp (word, 'i')}, function (err, keyword) {
             if (err) 
             res.send(err);
             res.json(keyword);
      });
  };

  exports.find_keyword = function(req, res) {
    var search_item = req.body.keyword;
    Keywords.find(req.body.keyword, function(err, keyword) {
        if (err)
        res.send(err);
      res.status(200).json(keyword);
    });
  };

  exports.get_count = function(req, res) {
    var target = req.body.target;
    Keywords.countDocuments({keyword:target}, function(err, count) {
      if (err) { return handleError(err) } //handle possible errors
      console.log(count);
      res.json({ count: count });
      //and do some other fancy stuff
  });
  };
  exports.add_a_keyword = function(req, res) {
    var new_keyword = new Keywords(req.body);
        new_keyword.save(function(err, keywords) {
      if (err)
        res.send(err);
        res.json(keywords);
    });
  };
