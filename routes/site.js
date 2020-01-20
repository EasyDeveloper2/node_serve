/**
 * Created by xujie on 2018/3/6.
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
var SiteCollection = require("../models/siteCollection")


// 1. 添加站点
// 2. 获取网站集合
// 3. 删除站点
// 4. 获取学习站点数据集合

// 1. 添加站点
router.post("/",(req,res,next)=>{
    co(function *() {
        var programId = req.body.programId
        var name = req.body.name
        var url = req.body.url
        if(programId==null){
            res.jsonp(errSet.paramsLess)
            return
        }
        if(name==null){
            res.jsonp(errSet.paramsLess)
            return
        }

        if(url==null){
            res.jsonp(errSet.paramsLess)
            return
        }

        var siteCollectionInfo = yield  SiteCollection.create({
                                       programId:programId,
                                       name:name,
                                       url:url
                                 })

            res.jsonp({code:0,msg:"成功",data:siteCollectionInfo})

    }).catch(err=>{
        console.log(err)
        res.jsonp(errSet.sqlErr)
    })
})

// 2. 获取网站集合
router.get("/list",(req,res,next)=>{
    co(function *() {
        var programId = req.query.programId
        if(programId==null){
            res.jsonp(errSet.paramsLess)
            return
        }
        var programTypeInfo = yield  ProgramType.findOne({
            where:{
                "id":programId
            }
        })
        if(programTypeInfo == null){
            res.jsonp(errSet.noProgramType)
            return
        }
        var list = yield SiteCollection.findAll({
            where:{
                programId:programId
            }
        })
        console.log(list)
        res.jsonp({code:0,msg:"成功",data:list})

    }).catch(err=>{
        console.log(err)
        res.jsonp(errSet.sqlErr)
    })
})

// 3.删除站点信息
router.delete("/",(req,res,next)=>{
    co(function *() {
        var id = req.query.id
        if(id == null){
            res.jsonp(errSet.paramsLess)
            return
        }
        var site = yield  SiteCollection.destroy({
            where:{
                id:id
            }
        })
        res.jsonp({code:0,msg:"成功"})

    }).catch(err=>{
        console.log(err)
        res.jsonp(errSet.sqlErr)
    })
})


// 4.获取学习站点数据集合
router.get("/set",(req,res,next)=>{
    co(function *() {
        var siteList = []
        var progromTypes = yield ProgramType.findAll()
        for (var i in progromTypes){
            var data = {}
            var programInfo = progromTypes[i]
            var list = yield  SiteCollection.findAll({
                where:{
                    programId:programInfo.id
                }
            })
            if(list.length>0){
                data["title"] = programInfo.name
                data["list"] = list
                siteList.push(data)
            }
        }
        res.jsonp({code:0,msg:"成功",data:siteList})
    }).catch(err=>{
        console.log(err)
        res.jsonp(errSet.sqlErr)
    })
})




module.exports = router