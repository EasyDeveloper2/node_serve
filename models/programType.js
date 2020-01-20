/**
 * Created by xujie on 2018/3/2.
 */

var sequelize = require("./sequelize");
var Sequelize = require("sequelize");

const ProgramType = sequelize.define("itc_programType",{
    name:{
        type:Sequelize.STRING
    },
    src:{
        type:Sequelize.STRING
    },
    desc:{
        type:Sequelize.STRING
    },
    url:{
        type:Sequelize.STRING
    },
    show:{
        type:Sequelize.INTEGER
    }
});

ProgramType.sync({force:false})

module.exports = ProgramType