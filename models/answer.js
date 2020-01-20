/**
 * Created by xujie on 2018/3/2.
 */
var sequelize = require("./sequelize");
var Sequelize = require("sequelize");

const Answer = sequelize.define("itc_answer",{
    questionId:{
        type:Sequelize.INTEGER
    },
    content:{
        type:Sequelize.STRING
    },
    userId:{
        type:Sequelize.STRING
    },
    adopt:{
        type:Sequelize.INTEGER
    }

});

Answer.sync({force:false})

module.exports = Answer