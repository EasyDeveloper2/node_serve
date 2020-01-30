
/**
 * 云通信基础能力业务短信发送、查询详情以及消费消息示例，供参考。
 * Created by xujie on 2018/2/16.
 */
const SMSClient = require('@alicloud/sms-sdk')
// ACCESS_KEY_ID/ACCESS_KEY_SECRET 根据实际申请的账号信息进行替换
const accessKeyId = 'LTAI8KRnny9k' // 阿里云账号
const secretAccessKey = 'eFpY2CwAMBo66crZ3VzE8Lx1SE' // 阿里云秘钥
//初始化sms_client
var smsClient = new SMSClient({accessKeyId, secretAccessKey})
//发送短信


module.exports = {
    // 参数中必须包含name和code
    sendSMS(params,success,failure){

            smsClient.sendSMS({
                PhoneNumbers: params.phone,
                SignName: '名博主',
                TemplateCode: 'SMS_49480322',
                TemplateParam: JSON.stringify(params)
            }).then(function (res) {
                var code = res.Code
                if (code === 'OK') {
                    //处理返回参数
                    success(res)

                }
            }, function (err) {
                failure(err)
            })

    }
}