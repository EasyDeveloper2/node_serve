/**
 * Created by xujie on 2018/2/16.
 */
/**
 * Created by xujie on 2018/2/5.
 */

var sequelize = require("./sequelize");
var Sequelize = require("sequelize");

const RegisterCode = sequelize.define("itc_registerCode",{
    code:{
        type:Sequelize.INTEGER
    },
    phone:{
        type:Sequelize.STRING
    },
    state:{
        type:Sequelize.INTEGER,
        default:-1
    },
    desc:{
        type:Sequelize.STRING
    }

});

RegisterCode.sync({force:false})

module.exports = RegisterCode
