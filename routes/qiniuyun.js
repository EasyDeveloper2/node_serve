/**
 * Created by xujie on 2018/2/22.
 */

var express = require('express');
var router = express.Router();
var qiniu = require("../utils/qiniu")


// 获取七牛云上传配置
router.get("/config",(req,res,next)=>{
    var key = qiniu.getKey()
    var token = qiniu.getToken()
    res.jsonp({code:0,msg:"成功",data:{"key":key,"token":token}})
})


module.exports = router