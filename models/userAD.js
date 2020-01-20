/**
 * Created by xujie on 2018/2/22.
 */

var sequelize = require("./sequelize");
var Sequelize = require("sequelize");

const UserAD = sequelize.define("itc_userAD",{
    name:{
        type:Sequelize.STRING
    },
    src:{
        type:Sequelize.STRING
    },
    desc:{
        type:Sequelize.STRING
    },
    userId:{
        type:Sequelize.STRING
    },
    articleCount:{
        type:Sequelize.INTEGER
    }
});

UserAD.sync({force:false})
module.exports = UserAD



