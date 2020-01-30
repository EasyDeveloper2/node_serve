

const sequelize = require("./sequelize");
const user = require("./user");
// 定义一个用户表
const User = sequelize.define('custom_user', user);
// 数据库同步 force 为false的时候表示只对表进行修改 如果设置为true 表示删除表进行重建
User.sync({force: false})

module.exports = {
    User
}