/**
 * Created by xujie on 2018/2/7.
 */

module.exports = {
    randomString(len) {
        var now = new Date()
        var prefix = "" + now.getFullYear()+now.getMonth()+now.getDay()+now.getHours()+now.getMinutes()
        len = len || 32;
        var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
        var maxPos = $chars.length;
        var pwd = '';
        for (i = 0; i < len; i++) {
            pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd+prefix;
    },
    randomNum(len){
        len = len || 6;
        var $chars = '023456789';
        var maxPos = $chars.length;
        var pwd = '';
        for (i = 0; i < len; i++) {
            pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    }
}
