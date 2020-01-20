/**
 * Created by xujie on 2018/2/13.
 */

var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'qq',
    auth: {
        user: '2461556682@qq.com',
        pass: 'uslkhcrmobclebhd' //授权码,通过QQ获取
    }
});



module.exports = {
    send(email,content,res){
        var mailOptions = {
            from: '2461556682@qq.com', // 发送者
            to: email, // 接受者,可以同时发送多个,以逗号隔开
            subject: 'ITC', // 标题
            text: '欢迎注册ITC,请填写验证码:'+content, // 文本
            // html: `<h3>欢迎注册ITC</h3><h4>
            // 你的验证码为:<div style="color:red">${content}<div></h4>`
        };

        transporter.sendMail(mailOptions, function (err, info) {
            res(err,info);
        });
    }

}
