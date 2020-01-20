/**
 * Created by xujie on 2018/3/2.
 */
var sequelize = require("./sequelize");
var Sequelize = require("sequelize");

const Question = sequelize.define("itc_question",{
    programId:{
        type:Sequelize.INTEGER
    },
    title:{
        type:Sequelize.STRING
    },
    keys:{
        type:Sequelize.STRING
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

Question.sync({force:false})

module.exports = Question