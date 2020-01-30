/**
 * Created by xujie on 2018/2/5.
 */

var Sequelize = require("sequelize");

module.exports = {
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
    token:{
        type:Sequelize.STRING
    }
}
