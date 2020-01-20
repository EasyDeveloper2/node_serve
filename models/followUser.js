/**
 * Created by xujie on 2018/2/23.
 */

var sequelize = require("./sequelize");
var Sequelize = require("sequelize");

const FollowUser = sequelize.define("itc_followUser",{
    userId:{
        type:Sequelize.STRING
    },
    followId:{
        type:Sequelize.STRING
    }
});

FollowUser.sync({force:false})

module.exports = FollowUser