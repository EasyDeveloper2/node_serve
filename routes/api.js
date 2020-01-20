/**
 * Created by xujie on 2018/3/8.
 */
/**
 * Created by xujie on 2018/2/20.
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

var errSet = require('./errSet');
var co = require("co")
var config = require("../config/config")
var emailManage = require("../utils/email")
var commentArticle = require("../models/commentArticle")
var followUser = require("../models/followUser")
var banner = require("../models/banner")

// API 接口

// 1.  获取用户信息
// 2.  获取用户所有专题
// 3.  获取专题下所有文章
// 4.  获取文章的详细内容
// 5.  对文章进行评论
// 6.  获取文章下面的评论
// 7.  删除文章下面的评论
// 8.  关注用户
// 9.  取消关注
// 10. 我的关注
// 11. 我的粉丝
// 12. 获取用户自己设备的banner图片


// 1 获取用户信息
// 头像昵称 打赏二维码 广告位
router.get("/userInfo",(req,res,next)=>{
    co(function*(){
        // 获取用户的id信息

        var secretKey = req.query.secretKey
        if(secretKey == null){
            res.jsonp(errSet.paramsLess)
            return
        }

        var userInfo = yield  user.findOne({
            'attributes': ['id','name', 'avatorUrl','wxQRSrc','showReward','email','allowCopy','showComment',"motto"],
            where:{
                AppSecret:secretKey
            }
        })

        if(userInfo != null){
            if(userInfo.avatorUrl != null && userInfo.avatorUrl.indexOf("http") == -1){
                userInfo.avatorUrl = config.ip + userInfo.avatorUrl
            }
            if(userInfo.wxQRSrc != null && userInfo.wxQRSrc.indexOf("http") == -1){
                userInfo.wxQRSrc = config.ip + userInfo.wxQRSrc
            }

            // 获取用户的
            res.jsonp({code:0,msg:"成功",data:userInfo})
            return
        }else{
            res.jsonp(errSet.noRegister)
        }

    }).catch(err=>{
        res.jsonp(err.sqlErr);
    })
})

// 2 获取用户所有专题
// 参数 需要传用户id
router.get("/allClassify",(req,res,next)=>{

    co(function*() {

        var secretKey = req.query.secretKey
        if(secretKey == null){
            res.jsonp(errSet.paramsLess)
            return
        }

        var userInfo = yield  user.findOne({
            'attributes': ['id'],
            where:{
                AppSecret:secretKey
            }
        })

        if(userInfo == null){
            res.jsonp(errSet.noRegister)
            return
        }

        var allClassify = yield  app.findAll({
            'attributes': ['name', 'desc','id','articleCount'],
            order:[
                ['createdAt','DESC']
            ],
            where:{
                userId:id
            }
        })

        for(var i in allClassify){
            var classify = allClassify[i]
            var articles = yield  article.findAll({
                where:{
                    classfyId:classify.id,
                    publish:1
                }
            })
            classify['articleCount'] = articles.length
        }

        res.jsonp({code:0,msg:"成功",data:allClassify})
    }).catch(err=>{
        console.log(err)
        res.jsonp(errSet.sqlErr)
    })

})

// 3 获取专题下所有文章
router.get('/allArticles',(req,res,next)=>{
    co(function*() {

        var secretKey = req.query.secretKey
        if(secretKey == null){
            res.jsonp(errSet.paramsLess)
            return
        }

        var userInfo = yield  user.findOne({
            'attributes': ['id'],
            where:{
                AppSecret:secretKey
            }
        })

        if(userInfo == null){
            res.jsonp(errSet.noRegister)
            return
        }

        var id = req.query.classifyId
        if(id==''){
            res.jsonp(errSet.paramsLess)
            return
        }
        var appInfo = yield  app.findOne({

            where:{
                id:id

            }
        })

        if(appInfo == null){
            res.jsonp(errSet.noClassfy)
            return
        }
        
        var allArticles = yield  article.findAll({
            'attributes': ['title','id',"author","createdAt"],
            order:[
                ['createdAt']
            ],
            where:{
                classfyId:id,
                publish:1
            }
        })
        res.jsonp({code:0,msg:"成功",data:allArticles})

    }).catch(err=>{
        console.log(err)
        res.jsonp(errSet.sqlErr)
    })
})

// 4 获取文章详细内容
// 文章的id
router.get("/article",(req,res,next)=>{
    co(function*() {
        var secretKey = req.query.secretKey
        if(secretKey == null){
            res.jsonp(errSet.paramsLess)
            return
        }

        var userInfo = yield  user.findOne({
            'attributes': ['id'],
            where:{
                AppSecret:secretKey
            }
        })

        if(userInfo == null){
            res.jsonp(errSet.noRegister)
            return
        }


        var id = req.query.id
        if(id==''){
            res.jsonp(errSet.paramsLess)
            return
        }
        var articleInfo = yield  article.findOne({
            attributes:['id','title','createdAt','author','md','readCount'],
            where:{
                id:id
            }
        })
        articleInfo.readCount += 1
        yield  articleInfo.save()

        if(articleInfo == null){
            res.jsonp(errSet.noClassfy)
            return
        }else{
            res.jsonp({code:0,msg:"成功",data:articleInfo})
        }


    }).catch(err=>{
        console.log(err)
        res.jsonp(errSet.sqlErr)
    })
})

// 5 发表评论
router.post("/comment/add",(req,res,next)=>{
    co(function *() {
        var secretKey = req.query.secretKey
        if(secretKey == null){
            res.jsonp(errSet.paramsLess)
            return
        }

        var userInfo = yield  user.findOne({
            'attributes': ['id'],
            where:{
                AppSecret:secretKey
            }
        })

        if(userInfo == null){
            res.jsonp(errSet.noRegister)
            return
        }

        var content = req.body.content
        var articleId = req.body.articleId

        if(articleId==null){
            res.jsonp(errSet.articleIdLess)
            return
        }
        var articleInfo = yield  article.findOne({
            where:{
                id:articleId
            }
        })

        if(articleInfo == null){
            res.jsonp(errSet.noArticle)
            return
        }

        var comment = yield  commentArticle.create({
            userId:userInfo.id,
            articleId:articleId,
            content:content
        })

        var data = {}
        data["id"]  = comment.id
        data["userId"] = userInfo.id
        data["created"] = comment.createdAt.toString().slice(0,10)
        data["content"] = comment.content
        data["avatorUrl"] = userInfo.avatorUrl
        data["name"] = userInfo.name
        res.jsonp({"code":0,"msg":"成功",data})
        //

    }).catch(err=>{
        console.log(err)
        res.jsonp(errSet.sqlErr)
    })
})

// 6.获取评论列表
router.get("/comments",(req,res,next)=>{
    co(function *() {
        var secretKey = req.query.secretKey
        if(secretKey == null){
            res.jsonp(errSet.paramsLess)
            return
        }

        var userInfo = yield  user.findOne({
            'attributes': ['id'],
            where:{
                AppSecret:secretKey
            }
        })

        if(userInfo == null){
            res.jsonp(errSet.noRegister)
            return
        }

        var articleId = req.query.articleId
        var comments = yield commentArticle.findAll({

            where:{
                articleId:articleId
            }
        })
        var results = []
        for(var i in comments){
            var data = {}
            var comment = comments[i]
            var userInfo = yield  user.findOne({
                where:{
                    id:comment.userId
                }
            })
            if(userInfo != null){
                data["userId"] = userInfo.id
                data["avatorUrl"] = userInfo.avatorUrl
                data["id"] = comment.id
                data["content"] = comment.content
                data["createdAt"] = comment.createdAt.toLocaleString().slice(0,10)
                data["name"] = userInfo.name
                results.push(data)
            }
        }
        res.jsonp({code:0,msg:"成功",data:results})

    }).catch(err=>{
        console.log(err)
        res.jsonp(errSet.sqlErr)
    })
})


// 7. 删除文章下面的留言
router.delete('/comment',(req,res,next)=>{
    co(function*(){
        var secretKey = req.query.secretKey
        if(secretKey == null){
            res.jsonp(errSet.paramsLess)
            return
        }

        var userInfo = yield  user.findOne({
            'attributes': ['id'],
            where:{
                AppSecret:secretKey
            }
        })

        if(userInfo == null){
            res.jsonp(errSet.noRegister)
            return
        }

        // 留言的id
        var id = req.query.id

        // 先查找
        var commentInfo = yield  commentArticle.findOne({
            where:{
                id:id
            }
        })

        if(commentInfo==null){
            res.jsonp(errSet.noComment)
            return
        }

        if(commentInfo.userId == userInfo.id){
            yield  commentInfo.destroy()
            res.jsonp({"code":0,"msg":"评论已删除",data:commentInfo})
            return
        }
        // 查找评论对应的文章
        var articleInfo = yield article.findOne({
            where:{
                id:commentInfo.articleId
            }
        })

        if(articleInfo == null){
            res.jsonp(errSet.noArticle)
            return
        }

        if(articleInfo.userId = userInfo.id){
            yield  commentInfo.destroy()
            res.jsonp({"code":0,"msg":"评论已删除",data:commentInfo})
            return
        }

        res.jsonp(errSet.notJurisdiction)
    }).catch(err=>{
        console.log(err)
        res.jsonp(errSet.sqlErr)
    })
})


// 8.  关注用户
router.post("/follow",(req,res,next)=>{
    co(function*(){
        var userId = req.body.userId
        var token = req.body.token
        // 验证用户是否存在
        if(token == null){
            res.jsonp(errSet.tokenLess)
            return
        }
        var follow = yield  user.findOne({
            where:{
                token:token
            }
        })
        if(follow  == null){
            res.jsonp(errSet.tokeInvalid)
            return
        }

        // 验证被关注的用户是否存在
        var userInfo = yield user.findOne({
            where:{
                id:userId
            }
        })

        if(userInfo == null){
            res.jsonp(errSet.noRegister)
            return
        }

        // 验证有没有被关注过
        var followInfo = yield  followUser.findOne({
            where:{
                userId:userInfo.id,
                followId:follow.id
            }
        })
        if(followInfo == null){
            yield followUser.create({
                userId:userInfo.id,
                followId:follow.id
            })
            res.jsonp({"code":0,"msg":"成功"})
            return
        }
        res.jsonp(errSet.hasFollow)


    }).catch(err=>{
        console.log(err)
        res.jsonp(errSet.sqlErr)

    })
})



// 9.  取消关注
router.delete("/follow",(req,res,next)=>{
    co(function*(){
        var userId = req.query.userId
        var token = req.query.token
        // 验证用户是否存在
        if(token == null){
            res.jsonp(errSet.tokenLess)
            return
        }
        var follow = yield  user.findOne({
            where:{
                token:token
            }
        })
        if(follow  == null){
            res.jsonp(errSet.tokeInvalid)
            return
        }

        // 验证被关注的用户是否存在
        var userInfo = yield user.findOne({
            where:{
                id:userId
            }
        })

        if(userInfo == null){
            res.jsonp(errSet.noRegister)
            return
        }

        // 验证有没有被关注过
        var followInfo = yield  followUser.findOne({
            where:{
                userId:userInfo.id,
                followId:follow.id
            }
        })

        if(followInfo == null){
            res.jsonp(errSet.notFollow)
            return
        }
        yield followInfo.destroy()
        res.jsonp({"code":0,"msg":"成功"})
    }).catch(err=>{
        console.log(err)
        res.jsonp(errSet.sqlErr)

    })

})

// 10. 我的关注
router.get("/myAttentions",(req,res,next)=>{

    co(function*(){

        var token = req.query.token
        if(token == null){
            res.jsonp(errSet.tokenLess)
            return
        }

        var userInfo = yield  user.findOne({
            where:{
                token:token
            }
        })

        if(userInfo==null){
            res.jsonp(errSet.tokeInvalid)
            return
        }

        var attentions = yield  followUser.findAll({
            where:{
                followId:userInfo.id

            }
        })

        var results = []
        for(var i in attentions){
            var data = {}
            var attention = attentions[i]
            userInfo = yield user.findOne({
                where:{
                    'id':attention.userId
                }
            })
            if(userInfo != null){
                // 查询发表的文章数量
                var articles = yield  article.findAll({
                    where:{
                        userId:userInfo.id,
                        publish:1
                    }
                })
                // 查询粉丝数量
                var follows = yield  followUser.findAll({
                    where:{
                        userId:userInfo.id
                    }
                })
                data["id"] = userInfo.id
                data["avatorUrl"] = userInfo.avatorUrl
                data["name"] = userInfo.name
                data["articleCount"] = articles.length
                data["followCount"] = follows.length
                results.push(data)
            }

        }
        res.jsonp({code:0,msg:"成功",data:results})


    }).catch(err=>{
        console.log(err)
        res.jsonp(errSet.sqlErr)
    })

})

// 11. 我的粉丝
router.get("/myFollows",(req,res,next)=>{

    co(function*(){

        var token = req.query.token
        if(token == null){
            res.jsonp(errSet.tokenLess)
            return
        }

        var userInfo = yield  user.findOne({
            where:{
                token:token
            }
        })

        if(userInfo==null){
            res.jsonp(errSet.tokeInvalid)
            return
        }

        var follows = yield  followUser.findAll({
            where:{
                userId:userInfo.id
            }
        })
        var results = []
        for(var i in follows){
            var data = {}
            var follow = follows[i]
            var userInfo = yield  user.findOne({
                where:{
                    id:follow.followId
                }
            })
            if(userInfo != null){
                var articles = yield article.findAll({
                    where:{
                        userId:userInfo.id,
                        publish:1
                    }
                })
                var follows = yield  followUser.findAll({
                    where:{
                        userId:userInfo.id
                    }
                })
                data["id"] = userInfo.id
                data["name"] = userInfo.name
                data["avatorUrl"] = userInfo.avatorUrl
                data["articleCount"] = articles.length
                data["followCount"] = follows.length
                results.push(data)
            }

        }

        res.jsonp({code:0,msg:"成功",data:results})

    }).catch(err=>{
        res.jsonp(errSet.sqlErr)
    })
})

// 12 . 检查是否已经关注过此博主
router.get("/isFollow",(req,res,next)=>{

    co(function*(){
        var token = req.query.token
        var userId = req.query.userId
        if(token == null){
            res.jsonp(errSet.tokenLess)
            return
        }
        if(userId == null){
            res.jsonp(errSet.paramsLess)
            return
        }

        var userInfo = yield  user.findOne({
            where:{
                token:token
            }
        })

        if(userInfo==null){
            res.jsonp(errSet.tokeInvalid)
            return
        }
        var followInfo = yield followUser.findOne({
            where:{
                'userId':userId,
                'followId':userInfo.id
            }
        })
        if(followInfo==null){
            res.jsonp({"code":0,"msg":"成功",data:{"hasFollow":false}})
            return
        }else{
            res.jsonp({"code":0,"msg":"成功",data:{"hasFollow":true}})
        }

    }).catch(err=>{
        res.jsonp(errSet)

    })

})
// 13. 获取用户banner
router.get("/bannerList",(req,res,next)=>{
    co(function*(){
        var secretKey = req.query.secretKey
        if(secretKey==''){
            res.jsonp(errSet.paramsLess)
            return
        }
        var userInfo = yield user.findOne({
            where:{
                AppSecret:secretKey
            }
        })
        if(userInfo == null){
            res.jsonp(errSet.secretkeyErr)
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

module.exports = router
