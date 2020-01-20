/**
 * Created by xujie on 2018/3/2.
 */

var sequelize = require("./sequelize");
var Sequelize = require("sequelize");

const LikeAnswer = sequelize.define("itc_likeAnswer",{
    answerId:{
        type:Sequelize.INTEGER
    },
    userId:{
        type:Sequelize.STRING
    }
});

LikeAnswer.sync({force:false})

module.exports = LikeAnswer