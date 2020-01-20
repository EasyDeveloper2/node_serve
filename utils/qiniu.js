/**
 * Created by xujie on 2018/2/22.
 */


var qiniu = require("qiniu");
var tools = require("./tools");
//需要填写你的 Access Key 和 Secret Key
qiniu.conf.ACCESS_KEY = '6I01Qid727OSJVAYI1_ZjB_cvZRh9427Ai3gAY5p';
qiniu.conf.SECRET_KEY = 'D5g1ZwJaZMxVR1Hu0owhINLpaVfCPXFOihikPFRw';
qiniu.conf.zone = qiniu.zone.Zone_z2;
//要上传的空间
var bucket = 'mingbozhu';


var formUploader  = new  qiniu.form_up.FormUploader(qiniu.conf)
var putExtra =   new qiniu.form_up.PutExtra();

module.exports = {
    getKey(){
        var date = new Date()
        return 'mbz'+ date.getFullYear() + date.getMonth() + date.getDay() + tools.randomString(10)
    },
    getToken(){
        var options = {
            scope: bucket ,
            expires: 7200,
            // callbackUrl: 'http://api.example.com/qiniu/upload/callback',
            returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}',
            callbackBodyType: 'application/json'
        }
        var putPolicy = new qiniu.rs.PutPolicy(options);
        var mac = new qiniu.auth.digest.Mac(qiniu.conf.ACCESS_KEY, qiniu.conf.SECRET_KEY);
        return putPolicy.uploadToken(mac);
    },
    upload(localFile,res){
        formUploader.putFile(this.getToken(), this.getKey(), localFile, putExtra, function(respErr, respBody, respInfo) {
            if (respErr) {
                throw respErr;
            }
            if (respInfo.statusCode == 200) {
                console.log(respInfo);
            } else {
                console.log(respInfo.statusCode);
                console.log(respBody);
            }

            res(respBody)

        });


    }
}


// //构造上传函数
// function uploadFile(uptoken, key, localFile) {
//     var extra = new qiniu.io.PutExtra();
//     qiniu.io.putFile(uptoken, key, localFile, extra, function(err, ret) {
//         if(!err) {
//             // 上传成功， 处理返回值
//             console.log(ret.hash, ret.key, ret.persistentId);
//         } else {
//             // 上传失败， 处理返回代码
//             console.log(err);
//         }
//     });
// }

