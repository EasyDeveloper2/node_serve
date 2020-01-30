/**
 * Created by xujie on 2018/2/9.
 */


var express = require('express');
var router = express.Router();
var fs = require("fs");
var path = require("path");
var moment = require("moment");
var errSet = require('./errSet');
var multer  = require('multer')
var config = require('../config/config');
var qiniu = require('../utils/qiniu');
var emailManage = require("../utils/email");
var aliyun = require('../utils/aliyun');

/**
 * @description 上传文件 
 * 目前只支持单文件上传
 */ 

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname,"../public/image"));
    },
    filename: function (req, file, cb) {
        const  date = new Date();
        cb(null, moment().get()+file.originalname);
    }
});
const  upload = multer({ storage: storage })
router.post('/upload', upload.single('file'),function (req, res, next) {
    const  path = req.file.path
    var fileHost = "http://qiniuyun.mingbozhu.com/"
    qiniu.upload(path,data=>{
        if(data.key != null){

            res.jsonp({code:"0",msg:"成功",data:{"relative":fileHost +data.key,"absolute":fileHost+data.key}})
        }else{
            res.jsonp(errSet.sqlErr)
        }
        fs.unlink(path,function (err) {
            if(err) throw err;
            console.log('成功')
        })
    });
});


/**
 * @description 发送邮件
 * @ignore 目前只支持单文件上传
 * @param string email 邮箱地址
 */
router.post('/email',(req,res,next)=>{
    co(function *() {
        var email = req.query.email
        if(email==''){
            res.jsonp(errSet.emailIsNull)
            return
        }
        // 生成随机验证码
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

/**
 * 获取验证码 
 */
router.post('/getVerifyCode',(req,res,next)=>{
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





module.exports = router