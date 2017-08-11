var express = require('express');
var router = express.Router();
var User = require("../models/user");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.post('/register',function (req,res,next) {
   User.register(req.body,function (err,user) {
      if(err)throw err ;
      res.json(user);
  })


});
router.post('/login',function (req,res,next) {
    User.emailLogin(req.body,function (err,token) {
        if(err)throw err ;
        res.json({token:token});
    })
});

module.exports = router;
