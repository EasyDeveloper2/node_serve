/**
 * Created by xujie on 2018/2/5.
 */
var sequelize = require("./sequelize");
var Sequelize = require("sequelize");

// 定义一个用户表
const User = sequelize.define('itc_user', {
    username: {
        type: Sequelize.STRING
    },

    password: {
        type: Sequelize.STRING
    },
    phone:{
        type:Sequelize.STRING
    },
    email:{
        type:Sequelize.STRING
    },

    age:{
      type:Sequelize.INTEGER
    },

    address:{
        type:Sequelize.STRING
    },

    token:{
      type:Sequelize.STRING
    },

    identity:{
        type:Sequelize.INTEGER
    },

    avatorUrl:{
        type:Sequelize.STRING
    },

    name:{
        type:Sequelize.STRING
    },

    articleNum:{
        type:Sequelize.INTEGER
    },

    classfyNum:{
        type:Sequelize.INTEGER
    },

    AppId:{
        type:Sequelize.STRING
    },

    AppSecret:{
        type:Sequelize.STRING
    },

    wxQRSrc:{
        type:Sequelize.STRING
    },
    showReward:{
        type:Sequelize.INTEGER
    },
    motto:{
        type:Sequelize.STRING
    },
    allowCopy:{
        type:Sequelize.INTEGER
    },
    showComment:{
        type:Sequelize.INTEGER
    },
    github:{
        type:Sequelize.STRING
    },
    weibo:{
        type:Sequelize.STRING
    },
    twitter:{
        type:Sequelize.STRING
    }

});


// 数据库同步 force 为false的时候表示只对表进行修改 如果设置为true 表示删除表进行重建
User.sync({force: false})

// 导出user对象
module.exports = User