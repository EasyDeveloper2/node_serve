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

// 上传文件
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname,"../public/image"));
    },
    filename: function (req, file, cb) {
        var date = new Date();
        cb(null, moment().get()+file.originalname);
    }
});

// var upload = multer({ storage: storage })


// router.post('/', upload.single('file'), function (req, res, next) {
//
//     var fileHost = "http://qiniuyun.kuzoutianya.com/"
//     qiniu.upload(path.join(__dirname,"../public/image/")+req.file.filename,data=>{
//         if(data.key != null){
//             res.jsonp({code:"0",msg:"成功",data:{"relative":fileHost +data.key,"absolute":fileHost+data.key}})
//         }else{
//             res.jsonp(errSet.sqlErr)
//         }
//     });
// });

var upload = multer({ storage: storage })

router.post('/', upload.single('file'),function (req, res, next) {
    var path = req.file.path

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



router.get('/upload', upload.single('file'), function (req, res, next) {
    qiniu.upload("public/image/(1518143629239)0.jpg",res=>{

    });

    res.jsonp({code:"0",data:{"relative":"/image/"+req.file.filename,"absolute":config.ip+"/image/"+req.file.filename}})
});

module.exports = router