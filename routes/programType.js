/**
 * Created by xujie on 2018/3/5.
 */

var express = require('express');
var router = express.Router();
var sequelize = require("../models/sequelize");
var markdown = require("markdown").markdown;
var marked = require('marked');
var fs = require('fs');
var path = require('path');
var tools = require('../utils/tools');
var aliyun = require('../utils/aliyun');
var pattern = require('../utils/pattern');

var Prism = require('prismjs');


var errSet = require('./errSet');
var co = require("co")
var config = require("../config/config")
var emailManage = require("../utils/email")

var CommentArticle = require("../models/commentArticle")
var FollowUser = require("../models/followUser")
var User = require('../models/user');
var App = require('../models/app');
var Article = require('../models/article');
var RegisterCode = require('../models/registerCode');
var Question = require("../models/question")
var Answer = require("../models/answer")
var LikeAnswer = require("../models/likeAnswer")
var ProgramType = require("../models/programType")



// 1. 获取所有标签
// 2. 删除标签
// 3. 添加标签

// 1.获取所有标签
router.get("/all",(req,res,next)=>{
    co(function *() {
        var programTypes = yield  ProgramType.findAll({
            where:{
                show:1
            }
        })
        res.jsonp({code:0,msg:"成功",data:programTypes})
    }).catch(res=>{
        console.log(res)
        res.jsonp(errSet.sqlErr)

    })
})

// 2.删除
router.delete("/",(req,res,next)=>{
    co(function *() {
        // 获取类型id
        // 获取token
        var id = req.query.id
        var token = req.query.token

        if(id==null){
           res.jsonp(errSet.paramsLess)
            return
        }

        if(token == null){
            res.jsonp(errSet.paramsLess)
            return
        }

        var userInfo = yield User.findOne({
            where:{
                token:token
            }
        })

        if(userInfo.identity != 0){
            res.jsonp(errSet.notJurisdiction)
            return
        }

        var programTypeInfo = yield  ProgramType.destroy({
            where:{
                id:id
            }
        })

        if(programTypeInfo==null){
            res.jsonp(errSet.noProgramType)
        }else{
            res.jsonp({code:0,msg:"成功",data:programTypeInfo})
        }
    }).catch(err=>{
       console.log(err)
        res.jsonp(errSet.sqlErr)
    })
})

// 3.增加
router.post("/",(req,res,next)=>{
    co(function *() {

        var token = req.body.token
        var name = req.body.name
        if(name==null){
            res.jsonp(errSet.paramsLess)
            return
        }

        if(token == null){
            res.jsonp(errSet.paramsLess)
            return
        }
        var userInfo = yield User.findOne({
            where:{
                token:token
            }
        })

        if(userInfo.identity != 0){
            res.jsonp(errSet.notJurisdiction)
            return
        }

        var programTypeInfo = yield  ProgramType.create({
            name:name
        })
        res.jsonp({code:0,msg:"成功",data:programTypeInfo})

    }).catch(err=>{

    })
})


module.exports = router
