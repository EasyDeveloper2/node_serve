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

var hljs = require('../public/highlight.js'); // https://highlightjs.org/




marked.setOptions({
    highLight: function(code,lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return '<pre class="hljs"><code>' +
                    hljs.highlight(lang, str, true).value +
                    '</code></pre>';
            } catch (__) {}
        }

        return '<pre class="hljs"><code style="overflow-x: auto">' + md.utils.escapeHtml(str) + '</code></pre>';
    }
});





var url = "http://api.mingbozhu.com"

/* GET home page. */
router.get('/blogs/:id', function(req, res, next) {
  // 获取用户id
  var userId = req.params.id
  var classifyId = req.query.classifyId
  var articleId = req.query.articleId
  var token = req.query.token
  if(userId==null){
    res.render('error',{message:"用户不存在"})
      return
  }
  co(function*(){
     var userInfo = yield  user.findOne({
         where:{
           id:userId
         }
     })
     if(userInfo==null){
         res.render('error',{message:"用户不存在"})
         return
     }
      // 获取用户文章列表
      var classifyList = yield  app.findAll({
          where:{
            userId:userId
          }
      })

      if(classifyId==null&&classifyList.length>0){
         classifyId = classifyList[0].id
      }
      var classfyListSet = []
      if(classifyList.length>0){
          for(var i in classifyList){
            var data = {}
            var classifyInfo = classifyList[i]
            var articles = yield  article.findAll({
                attributes:['id'],
                where:{
                  classfyId:classifyInfo.id,
                   publish:1

                }
            })
            data["id"] = classifyInfo.id
            data["name"] = classifyInfo.name
            data["articleCount"]=articles.length
              classfyListSet.push(data)
          }
      }

      var  articleList = yield  article.findAll({
              attributes:['id',"title"],
              where:{
                  classfyId:classifyId,
                  publish:1
              }
          })

      if(articleId==null&&articleList.length > 0){
        articleId = articleList[0].id
      }
      var articleInfo = null
      if (articleId!=null){
          articleInfo = yield  article.findOne({
              where:{
                  id:articleId
              }
          })
      }

      var comments = []
      if(articleInfo==null){
        articleInfo = {
          md:"此专题暂无文章"
        }
      }else{
          articleInfo.readCount += 1
          yield  articleInfo.save()
          // 获取文章的评论
          var commentList = yield commentArticle.findAll({
              where:{
                  articleId:articleInfo.id
              }
          })
          for(var i in commentList){
              var data = {}
              var commentInfo = commentList[i]
              var cuserInfo = yield user.findOne({
                  where:{
                      id:commentInfo.userId
                  }
              })
              data["avatorUrl"] = cuserInfo.avatorUrl
              data["name"] = cuserInfo.name
              data["content"]=commentInfo.content
              data["createdAt"]=commentInfo.createdAt.toLocaleString().slice(0,10)
              comments.push(data)

          }
      }

      // 查询用户token 是否失效
      var isLogin = false
      var isFollow = false
      if(token!=null){

          var fansUserInfo = yield  user.findOne({
              where:{
                 token:token
              }
          })
          console.log(fansUserInfo)
          if(fansUserInfo!=null){
              isLogin = true
              // 验证用户是否已关注
              var followUserInfo = yield followUser.findOne({
                  where:{
                      userId:userId,
                      followId:fansUserInfo.id
                  }
              })
              if(followUserInfo != null){
                  isFollow = true
              }
          }


      }

      var data = {
          url:url,
          userInfo:userInfo,
          title: userInfo.name,
          isLogin:isLogin,
          isFollow:isFollow,
          markdown:marked,
          cassifyList:classfyListSet,
          classifyId:classifyId,
          articleList:articleList,
          articleId:articleId,
          article:articleInfo,
          comments:comments}

      res.render('index', data);

  }).catch(err=>{
      res.render('error',{message:err})
  })
});



module.exports = router;
