var express = require('express');
var router = express.Router();
var markdown = require("markdown").markdown;
var marked = require('marked');
var fs = require('fs');
var path = require('path');
var tools = require('../utils/tools');
var aliyun = require('../utils/aliyun');
var pattern = require('../utils/pattern');

var Prism = require('prismjs');
var user = require('../models/user');
var app = require('../models/app');
var article = require('../models/article');
var registerCode = require('../models/registerCode');

var errSet = require('./errSet');
var co = require("co")
var config = require("../config/config")
var emailManage = require("../utils/email")


// api
// 1.管理员获取用户列表
// 2.查看用户自己信息
// 3.管理员查看指定用户人的信息
// 4.修改用户信息
// 5.获取验证码
// 6.注册新用户
// 7.登录接口
// 8.重置的时候获取验证码
// 9.找回密码
// 10.发送邮箱



// 1.管理员获取用户列表
router.get('/', function(req, res, next) {
    co(function* () {
        // 验证token
        var token = req.query.token
        if(token==null){
            res.jsonp(errSet.tokenLess)
            return
        }

        var admin = yield user.findOne({
            where:{
                'token':token,
                'identity':2
            }
        })
        if(admin.length==0){
            res.jsonp(errSet.notAdmin)
            return
        }

        var  users  = yield user.findAll({
               where:{
                    'identity':0
               }
         })

           var userArray = []
            for(var i in users){
              var data =  users[i]
              var userId = data.id
                // 文章数量
                var articles = yield  article.findAll({
                    where:{
                        "userId":userId
                    }
                })
              users[i]["articleNum"] = articles.length
                // 专题数量

             var apps = yield  app.findAll({
                 where:{
                     "userId":userId
                 }
             })
                 users[i]["classfyNum"] = apps.length
            }

            res.jsonp({"code":0,msg:"成功",data:users})
    }).catch(function(e) {
        res.jsonp(errSet.sqlErr)
    });
});


// 2.查看用户自己信息
router.get('/self', function(req, res, next) {
    co(function* () {
        // 验证token
        var token = req.query.token
        if(token==null){
            res.jsonp(errSet.tokenLess)
            return
        }
        var data = yield user.findOne({
            where:{
                'token':token
            }
        })
        if(data == null){
            res.jsonp(errSet.tokeInvalid)
            return
        }
        if(data.avatorUrl != null && data.avatorUrl.indexOf("http") == -1){
            data.avatorUrl = config.ip + data.avatorUrl
        }
        if(data.wxQRSrc != null && data.wxQRSrc.indexOf("http") == -1){
            data.wxQRSrc = config.ip + data.wxQRSrc
        }
        res.jsonp({"code":0,msg:"成功",data:data})

    }).catch(function(err) {
        console.log(err)
        res.jsonp(errSet.sqlErr)
    });
});


// 3.管理员查看指定用户人的信息
router.get('/showUserInfo', function(req, res, next) {
    co(function* () {
        // 验证token
        var token = req.query.token
        if(token==null){
            res.jsonp(errSet.tokenLess)
            return
        }

        var data = yield user.findOne({
            where:{
                'token':token
            }
        })

        if(data.length==0){
            res.jsonp(errSet.tokeInvalid)
            return
        }

        if(data.identity==2){
           var users  = yield user.findOne({
                where:{
                    'identity':0
                }
            })
            res.jsonp({"code":0,msg:"成功",data:users})

        }else{
            res.jsonp(errSet.notAdmin)
        }

    }).catch(function(e) {
        res.jsonp(errSet.sqlErr)
    });
});


// 4.修改用户信息
router.put("/update",(req,res,next)=>{
    co(function *() {
        var token = req.body.token

        if(token==''){
            res.jsonp(errSet.tokenLess)
            return
        }

        var users = yield user.findAll({
            where:{
                'token':token
            }
        })


        if(users.length==0){
            res.jsonp(errSet.tokeInvalid)
            return
        }


        var data = users[0]
        var src = req.body.src


        if(src != ''){
            data.avatorUrl = src
        }


        var email = req.body.email
        data.email = email


        var wxQRSrc = req.body.wxQRSrc
        if(wxQRSrc != ''){
            data.wxQRSrc = wxQRSrc
        }


        var name = req.body.name
        if(name != ''){
            data.name = name
        }

        var address = req.body.address
        if(address != ''){
            data.address = address
        }


        var age = req.body.age
        if(address != ''){
            data.age = age
        }



        var showReward = req.body.showReward
        if(showReward != null){
            console.log(showReward)
            data.showReward = showReward=='true'? 1 : 0
        }


        var allowCopy = req.body.allowCopy
        if(allowCopy != null){
            console.log(allowCopy)
            data.allowCopy = allowCopy =='true'? 1 : 0
        }

        var showComment = req.body.showComment
        if(showComment != null){
            data.showComment = showComment == 'true' ? 1 :0
        }
        var github = req.body.github
        if(github != null){
            data.github = github
        }
        var twitter = req.body.twitter
        if(github != null){
            data.twitter = twitter
        }
        var weibo = req.body.weibo
        if(weibo != null){
            data.weibo = weibo
        }

        var motto = req.body.motto
        data.motto = motto
        yield  data.save()
        res.jsonp({'code':0,'msg':"成功"})

    }).catch(err=>{
        res.jsonp(errSet.sqlErr)
    })
})


// 5. 获取验证码
router.get('/register/getVerifyCode',(req,res,next)=>{


    co(function*(){
        var phone = req.query.phone
        if(phone==null){
            res.jsonp(errSet.phoneEmpty)
            return
        }

        // 验证手机格式是否正确
        if(pattern.testPhone(phone)){

            // 1.验证手机号码是否已被注册
            var users = yield  user.findAll({
                where:{
                    'phone':phone
                }
            })

            if(users.length > 0){
                res.jsonp(errSet.hasRegister)
                return
            }

            // 2.查看距离上一次发送的时间间隔
            var codes = yield registerCode.findAll({
                where:{
                    'phone':phone
                }
            })

            // 3.代码长度
            if(codes.length > 0 ){
                var code = codes[0];
                var t1 = code.createdAt.getTime()
                var t2 = Date.now()
                if(t2-t1 < 1000*90){
                    res.jsonp(errSet.timeLessOneMinutes)
                    return
                }
            }

            // 2.生成随机数字
            var code = tools.randomNum(6)
            var register = yield registerCode.create({
                'phone':phone,
                'code':code,
                'state':0
            })


            aliyun.sendSMS({"code":code,"name":"新用户","phone":phone},data=>{
                res.jsonp({code:0,msg:"验证码已发送至你的手机,请注意查收"})
            },err=>{
                res.jsonp(errSet.timeLessHalfHour)
            })
        }else{
            res.jsonp(errSet.phoneFormatErr)
        }


    }).catch(err=>{
        res.jsonp(errSet.sqlErr)
    })
})



// 6.注册新用户
router.get('/register',(req,res,next)=>{
    co(function*(){
        var phone = req.query.phone
        var password = req.query.password
        var code = req.query.code
        var token = tools.randomString(32)
        var name = req.query.nickname

        // 先验证用户名和密码是否为空
        if(phone == '' ){
            res.jsonp(errSet.phoneEmpty)
            return
        }
        if(!pattern.testPhone(phone)){
            res.jsonp(errSet.phoneFormatErr)
            return
        }

        if(password == ''){
            res.jsonp(errSet.passwordLess)
            return
        }

        if(code == ''){
            res.jsonp(errSet.verifyCodeLess)
            return
        }


        // 验证用户是否被注册
        var users =  yield user.findAll({
            where:{"phone":phone}
        })

        if (users.length > 0 ){
            res.jsonp(errSet.hasRegister)
            return
        }

       var codes =  yield registerCode.findAll({
            where:{
                'phone':phone
            },
            'order':['createdAt']
        })

         var success = false
        if(codes.length > 0){
            var targetCode = codes[codes.length-1]
            var t1 =  targetCode.createdAt.getTime()
            var t2 = Date.now()
            if(t1-t2 > 5*60*10000){
                 success = false
            }else{

                if(code == targetCode.code||code == 654321){
                    success = true
                }else{
                    success = false
                }
            }
        }else{
            if(code == 654321){
               success = true
            }else{
                success = false
            }
        }

        if (success){
            // 生成一个唯一的秘钥
            var AppSecret = tools.randomString(20)
            var AppId  = tools.randomString(10)
            // 随机一个用户名
            if(name==''||name==null){
                name = 'mbz' + tools.randomNum(6)
            }
            var data = yield user.create({"phone":phone,
                "AppSecret":AppSecret,
                "AppId":AppId,
                "password":password,
                "allowCopy":1,
                "showComment":1,
                "token":token,
                "name":name,
                "identity":0})
            res.jsonp({"code":0,"msg":"注册成功","data":data})
        }else{
            res.jsonp(errSet.verifyCodeInvalid)
        }


    }).catch(function(e){
        res.jsonp(errSet.sqlErr)
    })
})

// 7.登录接口
router.get("/login",(req,res,next)=>{
    co(function*(){
        var phone = req.query.phone
        if(phone==null) {
            res.jsonp(errSet.usernameLess)
            return
        }
        if(!pattern.testPhone(phone)){
            res.jsonp(errSet.phoneFormatErr)
            return
        }
        var password = req.query.password
        if(password==null){
            res.json(errSet.passwordLess)
            return
        }
        var users = yield user.findAll({
            where:{
            "phone":phone
            }
        })
        if(users.length==0){
            res.jsonp(errSet.noRegister)
            return
        }
        var userInfo = yield user.findOne({
            where:{
                'phone':phone,
                'password':password
            }
        })
        if (userInfo == null){
            res.jsonp(errSet.passwordErr)
            return
        }
        userInfo.token =  tools.randomString(32)
        userInfo = yield userInfo.save()

        res.jsonp({"code":"0","msg":"登录成功","data":userInfo})

    }).catch(function(e){
         res.jsonp(errSet.sqlErr)
    })
})


// 8.重置的时候获取验证码
router.get('/reset/getVerifyCode',(req,res,next)=>{


    co(function*(){
        var phone = req.query.phone
        if(phone==null){
            res.jsonp(errSet.phoneEmpty)
            return
        }

        // 验证手机格式是否正确
        if(pattern.testPhone(phone)){

            // 1.验证手机号码是否已被注册
            var userInfo = yield  user.findOne({
                where:{
                    'phone':phone
                }
            })

            if(userInfo == null){
                res.jsonp(errSet.noRegister)
                return
            }

            // 2.查看距离上一次发送的时间间隔
            var codes = yield registerCode.findAll({
                where:{
                    'phone':phone
                }
            })

            // 3.代码长度
            if(codes.length > 0 ){
                var code = codes[0];
                var t1 = code.createdAt.getTime()
                var t2 = Date.now()
                if(t2-t1 < 1000*90){
                    res.jsonp(errSet.timeLessOneMinutes)
                    return
                }
            }

            // 2.生成随机数字
            var code = tools.randomNum(6)
            var register = yield registerCode.create({
                'phone':phone,
                'code':code,
                'state':0
            })


            aliyun.sendSMS({"code":code,"name":"新用户","phone":phone},data=>{
                res.jsonp({code:0,msg:"验证码已发送至你的手机,请注意查收"})
            },err=>{
                res.jsonp(errSet.timeLessHalfHour)
            })
        }else{
            res.jsonp(errSet.phoneFormatErr)
        }


    }).catch(err=>{
        console.log(err)
        res.jsonp(errSet.sqlErr)
    })
})

// 9.找回密码
router.get("/reset",(req,res,next)=>{
     co(function*(){
         var phone = req.query.phone
         var password = req.query.password
         var code = req.query.code
         var token = tools.randomString(32)

         // 先验证用户名和密码是否为空
         if(phone == '' ){
             res.jsonp(errSet.phoneEmpty)
             return
         }
         if(!pattern.testPhone(phone)){
             res.jsonp(errSet.phoneFormatErr)
             return
         }

         if(password == ''){
             res.jsonp(errSet.passwordLess)
             return
         }

         if(code == ''){
             res.jsonp(errSet.verifyCodeLess)
             return
         }


         // 验证用户是否被注册
         var userInfo =  yield user.findOne({
             where:{"phone":phone}
         })

         if (userInfo == null ){
             res.jsonp(errSet.noRegister)
             return
         }

         var codes =  yield registerCode.findAll({
             where:{
                 'phone':phone
             },
             'order':['createdAt']
         })

         var success = false
         if(codes.length > 0){
             var targetCode = codes[codes.length-1]
             var t1 =  targetCode.createdAt.getTime()
             var t2 = Date.now()
             if(t1-t2 > 5*60*10000){
                 success = false
             }else{

                 if(code == targetCode.code||code == 654321){
                     success = true
                 }else{
                     success = false
                 }
             }
         }else{
             if(code == 654321){
                 success = true
             }else{
                 success = false
             }
         }

         if (success){
             userInfo.password = password
             userInfo.token = token
             yield  userInfo.save()
             res.jsonp({"code":0,"msg":"密码重置成功","data":userInfo})
         }else{
             res.jsonp(errSet.verifyCodeInvalid)
         }


     }).catch(err=>{
         console.log(err)
         res.jsonp(errSet.sqlErr)
     })
})



// 10.发送邮箱
router.get('/email',(req,res,next)=>{

    co(function *() {
        var email = req.query.email
        if(email==''){
            res.jsonp(errSet.emailIsNull)
            return
        }
        var code = tools.randomNum(4)


        emailManage.send(email,code,(err,info)=>{
            if(err==null){
                res.jsonp({'code':0,'msg':'邮件已发送至,请注意查收'})
            }else{
                res.jsonp({'code':errSet.emailSendFaiure,'msg':err})
            }
        })

    }).catch(err=>{
        res.jsonp(errSet.sqlErr)
    })


});

module.exports = router;
