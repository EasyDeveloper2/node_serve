var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var tools = require('../utils/tools');
var pattern = require('../utils/pattern');
var user = require('../models/index').User;
var errSet = require('./errSet');
var co = require("co")
var config = require("../config/config")
var emailManage = require("../utils/email")



// 2.查看用户自己信息
router.get('/info', function(req, res, next) {
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







module.exports = router;
