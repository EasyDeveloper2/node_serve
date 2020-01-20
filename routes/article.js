/**
 * Created by xujie on 2018/2/5.
 */

var express = require('express');
var router = express.Router();
var errSet = require('./errSet');
var markdown = require("markdown").markdown;
var marked = require('marked');
var fs = require('fs');
var path = require('path');
var article = require('../models/article');
var user = require('../models/user');
var app = require('../models/app');

var Prism = require('prismjs');
var co = require('co')
var config = require('../config/config')

marked.setOptions({
    highlight: function (code) {

        return "<div style='color:rgb(51,51,51);font-weight: 500;background: rgb(245,245,245);overflow-x: scroll'>"+require(path.resolve('public/highlight.js')).highlightAuto(code).value+"</div>";
    }
});

// marked.setOptions({
//     highlight: function (code) {
//         return Prism.highlight(code, Prism.languages.javascript);;
//     }
// });


// 查看文章的细节
router.get('/', function(req, res, next) {
   co(function*(){

       var id = req.query.id
       if(id == null){
           res.jsonp(errSet.classfyIdLess)
           return
       }
       console.log(id)
       var data = yield  article.findOne({
           where:{
               "id":id
           }
       })

       if(data == null){
           res.jsonp(errSet.noArticle)
           return
       }
       res.jsonp({"code":0,"msg":"成功","data":data})

   }).catch(function(err){
       console.log(err)
      res.jsonp(errSet.sqlErr)
   })
});



// 获取所有文章列表
router.get('/all',(req,res,next)=> {

  co(function*(){
      var classfyId = req.query.classfyId
      if (classfyId == null){
          res.jsonp(errSet.classfyIdLess)
          return
      }
      // 先检查类名是否存在
      var apps = yield app.findAll({where:{
          'id':classfyId
      }})

      if(apps.length==0){
          res.jsonp(errSet.classfyIdLess)
          return
      }

      var currentApp = apps[0]
      if(currentApp.src != null && currentApp.src.indexOf("http")==-1){
          currentApp.src = config.ip + currentApp.src
      }





      var  data = yield article.findAll({
          attributes:['id','title'],
          where:{
              'classfyId':classfyId
          }
      })

      data = data.sort(function(item1,item2){
          if(item1.id>item2.id){
              return -1
          }else{
              return 1
          }
      })
      res.jsonp({"code":0,'msg':'成功','data':{'list':data,'app':currentApp}})

 }).catch(function(e){
     console.log(e)
     res.jsonp(e)
 })

})

// 生成文章
router.get('/add',function(req,res,next){
    co(function*(){

        var token = req.query.token
        if(token==null){
            res.jsonp(errSet.tokenLess)
            return
        }
        var users = yield  user.findAll({
            where:{
                'token':token
            }
        })
        if(users.length==0){
            res.jsonp(errSet.tokeInvalid)
            return
        }
        console.log(users)


        var classfyId = req.query.classfyId
        if(classfyId == null){
            res.jsonp(errSet.classfyIdLess)
            return
        }

        var date = new Date()
        var title = date.toDateString()
        var data = yield article.create({
            "title":title,
            "author":"酷走天涯",
            "desc":"",
            "md":"",
            "classfyId":classfyId,
            "userId":users[0].id

        })
        res.jsonp({'code':0,"msg":'文章创建成功','data':data})

    }).catch(function(e){
        res.jsonp(errSet.sqlErr)
    })
})



// 保存文章内容
router.post("/save",function(req,res,next){
    co(function*(){
        var id = req.body.id
        var md = req.body.md
        var title = req.body.title
        console.log(md)

        if(id==null){
            res.jsonp(errSet.articleIdLess)
            return
        }

        if(md==null){
            res.jsonp(errSet.mdLess)
            return
        }



        var author = "酷走天涯"
        // 先检测文章是否存在
        var articles = yield article.findAll({
            where:{
                'id':id
            }
        })
        if(articles.length==0){
            res.jsonp(errSet.noArticle)
            return
        }
        var data = yield  articles[0].update({
            "md":md,
            "title":title
        })
        res.jsonp({'code':0,'msg':"文章保存成功",'data':data})
    }).catch(function(err){
        console.log(err)
        res.jsonp(errSet.sqlErr)
    })
})

// 发表文章
router.get('/publish',(req,res,next)=>{
    co(function*(){
        var id = req.query.id
        if(id==null){
            res.jsonp(errSet.articleIdLess)
            return
        }
        var articles = yield article.findAll({
            where:{
                'id':id
            }
        })
        if(articles.length==0){
            res.jsonp(errSet.noArticle)
            return
        }
        var data = articles[0]
        data.publish = true
        yield  data.save()
        res.jsonp({"code":0,'msg':'成功','data':data})

    }).catch(function(e){

    })
})

// 撤销文章
router.get('/revoke',(req,res,next)=>{
    co(function*(){
        var id = req.query.id
        if(id==null){
            res.jsonp(errSet.articleIdLess)
            return
        }
        var articles = yield article.findAll({
            where:{
                'id':id
            }
        })
        if(articles.length==0){
            res.jsonp(errSet.noArticle)
            return
        }
        var data = articles[0];
        data.publish = false;
        yield  data.save()
        res.jsonp({'code':0,'msg':"已取消发布",'data':data});

    }).catch(function(e){
       res.jsonp(errSet.sqlErr)
    })
})



// 删除文章
router.get("/delete",(req,res,next)=>{
    co(function*(){
        var id = req.query.id
        if(id==null){
            res.jsonp(errSet.articleIdLess)
            return
        }
        var articles = yield article.findAll({
            where:{
                'id':id
            }
        })
        if(articles.length==0){
            res.jsonp(errSet.noArticle)
            return
        }
        var data = articles[0];
        yield  data.destroy();
        res.jsonp({'code':0,'msg':'删除成功','data':data})



    }).catch(function(e){
        res.jsonp(errSet.sqlErr)
    })
})




module.exports = router;

