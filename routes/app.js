var express = require('express');
var router = express.Router();
var app = require('../models/app');
var user = require('../models/user');
var errSet = require('./errSet');
var co = require("co")
var config = require("../config/config")
var user = require("../models/user")
var banner = require("../models/banner")



// 获取所有用户app应用
router.get('/all', function(req, res, next) {
    co(function*(){
        var token = req.query.token

        if(token ==null){
            res.jsonp(errSet.tokenLess)
            return
        }

        var userInfo = yield user.findOne({
            where:{
                'token':token
            }
        })

        if(userInfo.length == 0){
            res.jsonp(errSet.tokeInvalid)
            return
        }

        var apps = yield  app.findAll({
            order:[
                ['createdAt','DESC']
            ],
            where:{
                'userId':userInfo.id
            }
        })

        // for(var i in apps){
        //     if(apps[i].src != null && app[i].src.indexOf("http") == -1){
        //         apps[i].src = config.ip + apps[i].src
        //     }
        // }

        res.jsonp({'code':0,'msg':'成功','data':apps})

    }).catch(function(e){
        res.jsonp(errSet.sqlErr)
    })

});

// 获取专题图标和名称
router.get('/',(req,res,next)=>{
    co(function *() {
        // 验证用户的真实性
        var token = req.query.token
        var id     = req.query.id
        if(token == null){
            res.jsonp(errSet.tokenLess)
            return
        }
        var userInfo = yield  user.findOne({
            where:{
                token:token
            }
        })
        if(id == null){
            res.jsonp(errSet.appIdLess)
            return
        }
        if(userInfo == null){
            res.jsonp(errSet.tokeInvalid)
            return
        }
        var appInfo = yield  app.findOne({
            where:{
                userId:userInfo.id,
                id:id

            }
        })
        if(appInfo == null){
            res.jsonp(errSet.appIdLess)
            return
        }
        res.jsonp({code:0,msg:'成功',data:appInfo})
    }).catch(err=>{
        console.log(err)
        res.jsonp(errSet.sqlErr)
    })
})

// 修改专题的信息

// 获取专题图标和名称
router.put('/',(req,res,next)=>{
    co(function *() {

        // 验证用户的真实性
        var token = req.body.token
        console.log(token)
        var id     = req.body.id
        var src    = req.body.src
        var name   = req.body.name

        if(token == null){
            res.jsonp(errSet.tokenLess)
            return
        }

        var userInfo = yield  user.findOne({
            where:{
                token:token
            }
        })

        if(id == null){
            res.jsonp(errSet.appIdLess)
            return
        }

        if(userInfo == null){
            res.jsonp(errSet.tokeInvalid)
            return
        }

        var appInfo = yield app.findOne({
            where:{
                userId:userInfo.id,
                id:id
            }
        })

        if(appInfo == null){
            res.jsonp(errSet.appIdLess)
            return
        }
        if(src != null && src != null){
            appInfo.src = src
        }
        if(name != null && name != ''){
            appInfo.name = name
        }
        yield appInfo.save()
        res.jsonp({code:0,msg:'成功',data:appInfo})

    }).catch(err=>{
        console.log(err)
        res.jsonp(errSet.sqlErr)
    })
})

// 删除
// 获取专题图标和名称
router.delete('/',(req,res,next)=>{
    co(function *() {

        // 验证用户的真实性
        var token = req.query.token
        var id     = req.query.id


        if(token == null){
            res.jsonp(errSet.tokenLess)
            return
        }

        var userInfo = yield  user.findOne({
            where:{
                token:token
            }
        })

        if(id == null){
            res.jsonp(errSet.appIdLess)
            return
        }

        if(userInfo == null){
            res.jsonp(errSet.tokeInvalid)
            return
        }

        var appInfo = yield  app.findOne({
            where:{
                userId:userInfo.id,
                id:id
            }
        })

        if(appInfo == null){
            res.jsonp(errSet.appIdLess)
            return
        }
        yield appInfo.destroy()
        res.jsonp({code:0,msg:'成功',data:appInfo})

    }).catch(err=>{
        console.log(err)
        res.jsonp(errSet.sqlErr)
    })
})



// 添加一个应用类别
router.get('/add',(req,res,next)=>{
    co(function*(){

        var token = req.query.token
        if(token ==null){
            res.jsonp(errSet.tokenLess)
            return
        }
        var userInfo = yield user.findOne({
            where:{
                'token':token
            }
        })

        if(userInfo == null){
            res.jsonp(errSet.tokeInvalid)
            return
        }

        var name = req.query.name;
        var src = req.query.src;
        var desc = req.query.desc;

        if (name==null){
            res.jsonp(errSet.appNameLess)
            return
        }

        var data = yield  app.create({
            'name':name,
            'src':src,
            'desc':desc,
            'userId':userInfo.id
        })

        res.jsonp({'code':0,'msg':"成功",'data':data})

    }).catch(function(err){
        console.log(err)
        res.jsonp(errSet.sqlErr)
    })
})

// 获取banner列表
router.get("/bannerList",(req,res,next)=>{
    co(function*(){
        var token = req.query.token
        if(token==''){
            res.jsonp(errSet.paramsLess)
            return
        }
        var userInfo = yield user.findOne({
            where:{
                token:token
            }
        })
        if(userInfo == null){
            res.jsonp(errSet.tokeInvalid)
            return
        }
        var banners = yield banner.findAll({
            where:{
                userId:userInfo.id
            }
        })
        res.jsonp({"code":0,data:banners})


    }).catch(err=>{
        console.log(err)
        res.jsonp(errSet.sqlErr)
    })
})

// 上传banner
router.post("/banner",(req,res,next)=>{
    co(function*(){
        var token = req.body.token

        if(token==''){
            res.jsonp(errSet.paramsLess)
            return
        }
        var userInfo = yield user.findOne({
            where:{
                token:token
            }
        })
        if(userInfo == null){
            res.jsonp(errSet.tokeInvalid)
            return
        }
        var src  = req.body.src
        var url = req.body.url
        var data = yield banner.create({
            userId:userInfo.id,
            src:src,
            url:url
        })
        res.jsonp({"code":0,msg:"成功",data:data})

    }).catch(err=>{
        console.log(err)
        res.jsonp(errSet.sqlErr)
    })
})

// 删除banner
router.delete("/banner",(req,res,next)=>{
    co(function*(){
        var token = req.query.token
        if(token==''){
            res.jsonp(errSet.paramsLess)
            return
        }
        var userInfo = yield user.findOne({
            where:{
                token:token
            }
        })
        if(userInfo == null){
            res.jsonp(errSet.secretkeyErr)
            return
        }
        var id  = req.query.id

        var data = yield banner.destroy({
            where:{
                id:id,
                userId:userInfo.id
            }
        })
        res.jsonp({"code":0,msg:"成功",data:data})
    }).catch(err=>{
        res.jsonp(errSet.sqlErr)
    })
})




module.exports = router