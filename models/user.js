var mongoose = require("mongoose");
var userSchema = mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true ,
    },
    password:{
        type:String,
        required:true,
    },
    username:{
        type:String,
        required:true,
        unique:true
    },
    active:{
        type:Boolean,
        default:false
    }
});
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var config = require('../config');
var mailgun = require('mailgun-js')({apiKey:config.mailgun_key,
    domain: config.mailgun_domain});
userSchema.statics = {
    register:function(data,cb){
        var user = new User({
            email:data.email,
            password:bcrypt.hashSync(data.password),
            username:data.username
        });
        user.save(function (err,user) {
            user.sendActivationEmail();
            cb(err,user)
        });
    },
    emailLogin:function (data,cb) {
      User.findOne({email:data.email},function (err,user) {
             if(err)cb(err,null);
         user.validatePassword(data.password,function (err,result) {
             if(err)throw cb(err,null) ;
             console.log(result)
             if(result){
                 var token = jwt.sign({_id:user._id},
                     config.secret,{ expiresIn: 60*60*24*7 });
                 cb(null,token);
             }else{
                 cb(null,"invalid password");
             }



         })
     })   
    },
    usernameLogin:function (data,cb) {
        User.findOne({username:data.username},function (err,user) {
            if(err)cb(err,null);
            user.validatePassword(data.password,function (err,result) {
                if(err)throw cb(err,null) ;
                console.log(result)
                if(result){
                    var token = jwt.sign({_id:user._id},
                        config.secret,{ expiresIn: 60*60*24*7 });
                    cb(null,token);
                }else{
                    cb(null,"invalid password");
                }



            })
        })
    }
};
userSchema.methods={
    validatePassword: function(password,cb) {
        return bcrypt.compare(password, this.password,function (err,result) {
            cb(err,result);
        });
    },
    sendActivationEmail:function () {
        var token = jwt.sign({_id:this._id,type:'activation link'},
            config.secret,{ expiresIn: 60*60*24*7 } );

        var data = {
            from: config.system_auth_mail,
            to: this.email,
            subject: 'activate your account',
            text: "please activate you account by visiting the link below \n "+
            "<a href="+config.host+'\\auth\\activate\\'+token+">activate now </a>"
        };
        mailgun.messages().send(data, function (err, body) {
            if(err)throw err
        });
    }
};
var User = mongoose.model("user",userSchema);
module.exports = User;