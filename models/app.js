/**
 * Created by xujie on 2018/2/5.
 */

var sequelize = require("./sequelize");
var Sequelize = require("sequelize");

const App = sequelize.define("itc_app",{
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

App.sync({force:false})

module.exports = App
