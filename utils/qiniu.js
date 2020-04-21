/**
 * Created by xujie on 2018/2/22.
 */


const qiniu = require("qiniu");
const tools = require("./tools");
//需要填写你的 Access Key 和 Secret Key
qiniu.conf.ACCESS_KEY = '6I01Qid727OSJVAYI1_ZjB_';
qiniu.conf.SECRET_KEY = 'D5g1ZwJaZMxVR1Hu0owhINLp';
qiniu.conf.zone = qiniu.zone.Zone_z2;
//要上传的空间
const bucket = 'mingbozhu';
const formUploader  = new  qiniu.form_up.FormUploader(qiniu.conf)
const putExtra =   new qiniu.form_up.PutExtra();

module.exports = {
    getKey(){
        const date = new Date()
        return 'mbz'+ date.getFullYear() + date.getMonth() + date.getDay() + tools.randomString(10)
    },
    getToken(){
        const options = {
            scope: bucket ,
            expires: 7200,
            // callbackUrl: 'http://api.example.com/qiniu/upload/callback',
            returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}',
            callbackBodyType: 'application/json'
        }
        const putPolicy = new qiniu.rs.PutPolicy(options);
        const mac = new qiniu.auth.digest.Mac(qiniu.conf.ACCESS_KEY, qiniu.conf.SECRET_KEY);
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


