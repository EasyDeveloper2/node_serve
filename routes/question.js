/**
 * Created by xujie on 2018/3/2.
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

// 1.获取程序所有类别
// 2.提交问题
// 3.获取主要程序类别
// 4.根据程序id 获取问题 考录分页加载
// 5.获取今日答题榜单
// 6.答题总榜单
// 7.我的提问
// 8.回答问题
// 9.点赞接口
// 10.取消点赞
// 11.采纳接口
// 12.我的回答的问题
// 13.关键字搜索
// 14.获取问题详情
// 15.答案列表




// 1.获取程序类别
router.get("/AllProgramTypes",(req,res,next)=>{
    co(function *() {
        var programTypes = yield  ProgramType.findAll()
        res.jsonp({code:0,msg:"成功",data:programTypes})

    }).catch(err=>{
        console.log(err)
        res.jsonp(errSet.sqlErr)
    })

})

//2.提交问题
router.post("/",(req,res,next)=>{
    co(function *() {
        // 获取用户token
        var token = req.body.token
        var programId = req.body.programId
        var title = req.body.title
        var content = req.body.content
        var keys = req.body.keys

        if(token==null){
            res.jsonp(errSet.tokenLess)
            return
        }
        var userInfo = yield  User.findOne({
            where:{
                token:token
            }
        })
        if(userInfo==null){
            res.jsonp(errSet.tokeInvalid)
            return
        }
        if(title==null||title==''){
            res.jsonp(errSet.questionTitleLess)
            return
        }
        if(content == null||title==''){
            res.jsonp(errSet.questionContentLess)
            return
        }
        // 获取
        var questionInfo = yield Question.create({
                programId:programId,
                userId:userInfo.id,
                keys:keys,
                title:title,
                content:content
        })
        res.jsonp({code:0,msg:"成功",data:questionInfo})


    }).catch(res=>{
        console.log(res)
        res.jsonp(errSet.sqlErr)

    })
})

// 3.获取主要程序类别
router.get("/programTypes",(req,res,next)=>{
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

// 4.根据程序类别id 获取问题 考录分页加载
router.get("/list",(req,res,next)=>{
    co(function *() {
        var programId = req.query.programId
        var questionArray = []
        var solve = req.query.solve
        if(solve==null||solve==''){
            solve == 0
        }

        if(programId == null||programId == ''){
            questionArray = yield  Question.findAll({})
        }else{
            questionArray = yield  Question.findAll({
                where:{
                    programId:programId
                }
            })
        }

        var results = []
        for(var i in questionArray){
            var data = {}
            var questionInfo = questionArray[i]
            // 查找用户信息
            var userInfo = yield  User.findOne({
                where:{
                    id:questionInfo.userId
                }
            })
            // 查找有没有解决
            var answerInfo = yield  Answer.findOne({
                where:{
                    questionId:questionInfo.id,
                    adopt:1
                }
            })
            if(answerInfo!=null){
               questionInfo.adopt = 1
            }

            var answerList = yield  Answer.findAll({
                where:{
                    questionId:questionInfo.id
                }
            })

            if(userInfo != null){

               var  programType = yield ProgramType.findOne({
                    where:{
                        "id":questionInfo.programId
                    }
                })
                data["userId"] = userInfo.id
                data["avatorUrl"] = userInfo.avatorUrl
                data["name"] = userInfo.name
                data["question"] = questionInfo
                data["createdAt"] = questionInfo.createdAt.toLocaleString().slice(0,18)
                data["programType"] = programType.name
                data["answerCount"] = answerList.length
                if(solve==0&&questionInfo.adopt==0){
                    results.push(data)
                }

                if(solve==1&&questionInfo.adopt==1){
                    results.push(data)
                }

            }
        }
        console.log(results)
        res.jsonp({code:0,msg:"成功","data":results})

    }).catch(res=>{
        console.log(res)
        res.jsonp(errSet.sqlErr)

    })
})

// 5.获取今日答题榜单
router.get("/rank/today",(req,res,next)=>{
    co(function *() {

    }).catch(res=>{
        console.log(res)

    })
})
// 6.答题总榜单
router.get("/rank/all",(req,res,next)=>{
          sequelize.query("select userId,Count(*) as adoptCount from `itc_answers` where adopt=1 group by userId order by adoptCount desc limit 10").spread(function(data,ms){

              co(function *() {
           var list = []
           for(var i in data){

               var userInfo = data[i]
               var userData =  yield  User.findOne({
                   where:{
                       'id':userInfo.userId
                   }
               })
               userInfo["name"] = userData.name
               userInfo["avatorUrl"] = userData.avatorUrl
               var articleList = yield  Article.findAll({
                   attributes:['id'],
                   where:{
                       userId:userInfo.userId
                   }
               })
               userInfo["articleCount"] =  articleList.length
               list.push(userInfo)
           }
           res.jsonp({code:0,msg:"成功",data:list})

              }).catch(res=>{
                  console.log(res)

              })


        })


})
// 7.我的提问
router.get("/myQuestionList",(req,res,next)=>{
    co(function *() {

    }).catch(res=>{
        console.log(res)

    })
})
// 8.回答问题
router.post("/answer",(req,res,next)=>{
    co(function *() {
        var questionId = req.body.questionId
        var content = req.body.content
        var token = req.body.token
        if(token==null){
            res.jsonp(errSet.tokenLess)
            return
        }
        var userInfo = yield  User.findOne({
            where:{
                'token':token
            }
        })
        if(userInfo == null){
            res.jsonp(errSet.tokeInvalid)
            return
        }
        if(questionId==null){
            res.jsonp(errSet.paramsLess)
            return
        }
        var questionInfo = yield  Question.findOne({
            where:{
                "id":questionId
            }
        })
        if(questionInfo==null){
            res.jsonp(errSet.noQuestion)
            return
        }
        if(content == '' || content == null){
            res.jsonp(errSet.paramsLess)
            return
        }

        var answers = yield Answer.create({
                'content':content,
                'userId':userInfo.id,
                'questionId':questionInfo.id,
                'adopt':0
        })
        res.jsonp({code:0,msg:"成功",data:answers})
    }).catch(res=>{
        console.log(res)

    })
})

// 9.点赞接口
router.post("/answer/like",(req,res,next)=>{
    co(function *() {
        var answerId = req.body.answerId
        var token = req.body.token


        if(token==null){
            res.jsonp(errSet.tokenLess)
            return
        }
        var userInfo = yield  User.findOne({
            where:{
                token:token
            }
        })

        if(userInfo == null){
            res.jsonp(errSet.tokeInvalid)
            return
        }

        var answerInfo = yield  Answer.findOne({
            where:{
                id:answerId
            }
        })

        if(answerInfo==null){
            res.jsonp(errSet.noAnswer)
            return
        }
        var likeAnswer = yield  LikeAnswer.findOne({
            where:{
                'answerId':answerId,
                 'userId':userInfo.id
            }
        })
        if (likeAnswer==null){
            likeAnswer = yield  LikeAnswer.create({
                answerId:answerId,
                userId:userInfo.id
            })
        }
        res.jsonp({code:0,msg:"成功",data:likeAnswer})


    }).catch(res=>{
        console.log(res)
        res.jsonp(errSet.sqlErr)
    })
})

// 10.取消点赞接口
router.delete("/answer/like",(req,res,next)=>{
    co(function *() {
        var answerId = req.query.answerId
        var token = req.query.token
        console.log(answerId)
        if(token==null){
            res.jsonp(errSet.tokenLess)
            return
        }
        var userInfo = yield  User.findOne({
            where:{
                token:token
            }
        })
        if(userInfo == null){
            res.jsonp(errSet.tokeInvalid)
            return
        }

        var answerInfo = yield  Answer.findOne({
            where:{
                id:answerId
            }
        })

        if(answerInfo==null){
            res.jsonp(errSet.noAnswer)
            return
        }


        var likeAnswer = yield  LikeAnswer.findOne({
            where:{
                answerId:answerId,
                userId:userInfo.id
            }
        })

        if(likeAnswer.userId != userInfo.id){
            res.jsonp(errSet.notJurisdiction)
            return
        }
        likeAnswer = yield likeAnswer.destroy()
        res.jsonp({code:0,msg:"成功"})

    }).catch(res=>{
        console.log(res)

    })
})

// 11.采纳接口
router.post("/adopt",(req,res,next)=>{
    co(function *() {
        var token = req.body.token
        var answerId = req.body.answerId
        if(token == null){
            res.jsonp(errSet.tokenLess)
            return
        }
        var userInfo = yield  User.findOne({
            where:{
                token:token
            }
        })
        if(userInfo==null){
            res.jsonp(errSet.tokeInvalid)
            return
        }

        var answerInfo = yield  Answer.findOne({
            where:{
                'id':answerId
            }
        })
        if(answerInfo == null){
            res.jsonp(errSet.noAnswer)
            return
        }

        var questionInfo = yield  Question.findOne({
            where:{
                "id":answerInfo.questionId
            }
        })


        if(questionInfo.userId != userInfo.id){
            res.jsonp(errSet.notJurisdiction)
            return
        }

        if(questionInfo != null){
            questionInfo.adopt = true
            yield  questionInfo.save()
        }

        if(answerInfo == null){
            res.jsonp(errSet.noAnswer)
            return
        }

        answerInfo.adopt = 1

        yield  answerInfo.save()
        res.jsonp({code:0,msg:"成功",data:answerInfo})

    }).catch(res=>{
        console.log(res)

    })
})
// 12.我的回答的问题
router.get("/myAnswerList",(req,res,next)=>{
    co(function *() {

    }).catch(res=>{
        console.log(res)

    })
})
// 13.关键字搜索
router.get("/search",(req,res,next)=>{
    co(function *() {
        var key = req.query.key
        var questionList = yield Question.findAll({
            'where': {
                '$or':[
                    {'title': {
                              '$like': '%'+key+'%'
                              }
                    },
                    {'content': {
                               '$like': '%'+key+'%'
                              }
                    },
                ]
            }
        });
        var results = []
        for (var i in questionList){
             var data = {}
             var question = questionList[i]
             var userInfo = yield  User.findOne({
                  where:{
                      'id':question.userId
                  }
             })
            data["name"] = userInfo.name
            data["avatorUrl"] = userInfo.avatorUrl
            data["id"] = userInfo.id
            data["title"] = question.title
            data["content"] = question.content
            data["questionId"] = question.id
            data["createdAt"] = question.createdAt.toLocaleString().slice(0,18)
            results.push(data)

        }

        res.jsonp({code:0,msg:"成功",data:results})

    }).catch(res=>{
        console.log(res)

    })
})

// 14.获取问题详情
router.get("/",(req,res,next)=>{
    co(function*(){
        var questionId = req.query.questionId
        var token = req.query.token
        var userSelf = null
        if(token != null || token != ''){
            userSelf = yield  User.findOne({
                where:{
                    token:token
                }
            })
        }

        if(questionId==null){
            res.jsonp(errSet.paramsLess)
            return
        }
        var questionInfo = yield Question.findOne({
            where:{
                "id":questionId
            }
        })
        if(questionInfo==null){
            res.jsonp(errSet.noQuestion)
            return
        }
        var userInfo = yield  User.findOne({
            attributes:['id','avatorUrl','name'],
            where:{
                id:questionInfo.userId
            }
        })
        var articles = yield Article.findAll({
            attributes:['id'],
            where:{
                userId:userInfo.id
            }
        })
        var followList = yield  FollowUser.findAll({
            attributes:['id'],
            where:{
                userId:userInfo.id
            }
        })
        // 查找用户信息
        var userInfoData = {}
        userInfoData["id"] = userInfo.id
        userInfoData["name"] = userInfo.name
        userInfoData["avatorUrl"] = userInfo.avatorUrl
        userInfoData["fansCount"] = followList.length
        userInfoData["articleCount"] = articles.length

        // 判断是不是发问题用户本人
        if (userSelf != null){
            if(userSelf.id == questionInfo.userId){
                userInfoData["isSelf"] = true
            }
        }


        // 查找类别信息
        var programTypeInfo = yield ProgramType.findOne({
            where:{
                'id':questionInfo.programId
            }
        })


        var questionData = {}
        questionData["id"] = questionInfo.id
        questionData["programName"] = programTypeInfo.name
        questionData["title"] = questionInfo.title
        questionData["content"] = questionInfo.content

        var answerInfo = yield  Answer.findOne({
            where:{
                'questionId':questionId,
                'adopt':1
            }
        })
        if(answerInfo==null){
            questionData["adopt"] = 0
        }else{
            questionData["adopt"] = 1
        }

        // 查找问题
        var resData = {}
        resData["userInfo"] = userInfoData
        resData["question"] = questionData
        res.jsonp({code:0,msg:"成功",data:resData})

    }).catch(err=>{
        console.log(err)
        res.jsonp(errSet.sqlErr)
    })
})

// 15.答案列表
router.get("/answer/list",(req,res,next)=>{
    co(function *() {
        var questionId = req.query.questionId
        var token = req.query.token
        var currentUser = null
        if(token != null){
            currentUser = yield  User.findOne({
                where:{
                    token:token
                }
            })
        }
        var questionInfo = yield  Question.findOne({
            where:{
                id:questionId
            }
        })
        if(questionInfo == null){
            res.jsonp(errSet.noQuestion)
            return
        }
        var answerList = yield Answer.findAll({
            where:{
                questionId:questionInfo.id
            }
        })
        var results = []
        for(var i in answerList){
            var data = {}
            var answerInfo = answerList[i]
            // 查找用户信息
            var userInfo = yield  User.findOne({
                where:{
                    'id':answerInfo.userId
                }
            })
            // 查找点赞数量
            var likes = yield LikeAnswer.findAll({
                where:{
                    answerId:answerInfo.id
                }
            })
            var isLike = false
            if (currentUser != null)
            for(var i in likes){
                var like = likes[i]
                if(currentUser.id == like.userId){
                    isLike = true
                    break;
                }
            }

            data["id"] = userInfo.id
            data["name"] = userInfo.name
            data["avatorUrl"] = userInfo.avatorUrl
            data["answer"] = answerInfo.content
            data["createdAt"] = answerInfo.createdAt.toLocaleString().slice(0,18)
            data["answerId"] = answerInfo.id
            data["adopt"] = answerInfo.adopt
            data["likeNum"] = likes.length
            data["isLike"] = isLike
            results.push(data)

        }
        res.jsonp({code:0,msg:"成功",data:results})

    }).catch(err=>{
        console.log(err)
        res.jsonp(errSet.sqlErr)
    })
})



module.exports = router