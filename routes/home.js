/**
 * Created by xujie on 2018/2/21.
 */

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
var recommendClassify = require('../models/recommendClassify');

var errSet = require('./errSet');
var co = require("co")
var config = require("../config/config")
var emailManage = require("../utils/email")

// API
// 1.获取推荐专题
// 2.获取博主排行榜

// 1.获取推荐的专题
router.get("/recommend/classify",(req,res,next)=>{
    co(function*(){
        // 获取推荐专题的id数组
        var recommends = yield  recommendClassify.findAll()
        if(recommends.length == 0){
            res.jsonp({code:0,msg:"成功",data:[]})
            return
        }
        var results = []
        for(var i in recommends){
            var classifyId = recommends[i].classifyId
            var classify = yield app.findOne({
                where:{
                    id:classifyId
                }
            })
            if(classify != null){
               if(classify.src !=null && classify.src.indexOf("http") ==-1){
                   classify.src = config.ip + classify.src
               }
                results.push(classify)
            }
        }
        res.jsonp({code:0,msg:"成功",data:results})


    }).catch(err=>{
        console.log(err)
        res.jsonp(errSet)
    })

})

// 2.获取博主排行榜
router.get("/bloggers",(req,res,next)=>{
    co(function*(){


        var users = yield user.findAll({

        })
        var array = []
        for(var i in users){
            var data = {}
            var userInfo = users[i]
            if(userInfo.avatorUrl != null && userInfo.avatorUrl.indexOf("http") == -1 ){
                userInfo.avatorUrl = config.ip + userInfo.avatorUrl
            }
            data["id"] = userInfo.id
            data["name"] = userInfo.name
            data["avatorUrl"] = userInfo.avatorUrl
            if(data.name == null){
                continue
            }

            // 查询用户有多少个专题
            var articles = yield article.findAll({
                where:{
                    userId:userInfo.id,
                    publish:1
                }
            })
            data["articleCount"] = articles.length

            // 查询最后一篇发布过的文章
            var articleInfo = yield  article.findOne({
                where:{
                    userId:userInfo.id
                },
                order:[['createdAt','DESC']]
            })

            if(articleInfo != null){
                data["lastArticleTitle"] = articleInfo.title
                data["lastArticleCreateAt"] = articleInfo.createdAt.toJSON().slice(0,10)
                array.push(data)
            }
           array = array.sort(function($1,$2){
                return $1.articleCount < $2.articleCount
            })

        }
        console.log(array)
        res.jsonp({code:"0",msg:"成功",data:array})
    }).catch(err=>{
        console.log(err)
        res.jsonp(errSet)
    })
})



module.exports = router