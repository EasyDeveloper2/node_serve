/**
 * Created by xujie on 2018/2/22.
 */

/**
 * Created by xujie on 2018/2/5.
 */

var sequelize = require("./sequelize");
var Sequelize = require("sequelize");

const Function = sequelize.define("itc_function",{
    name:{
        type:Sequelize.STRING
    },
    src:{
        type:Sequelize.STRING
    },
    desc:{
        type:Sequelize.STRING
    },
    userType:{
        type:Sequelize.STRING
    }
});

Function.sync({force:false})

module.exports = Function
