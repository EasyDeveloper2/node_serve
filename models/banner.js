/**
 * Created by xujie on 2018/2/22.
 */

var sequelize = require("./sequelize");
var Sequelize = require("sequelize");

const Banner = sequelize.define("itc_banner",{
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

Banner.sync({force:false})

module.exports = Banner