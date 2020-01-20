/**
 * Created by xujie on 2018/3/6.
 */


var sequelize = require("./sequelize");
var Sequelize = require("sequelize");

const SiteCollection = sequelize.define("itc_siteCollection",{
   name:{
       type:Sequelize.STRING
   },
   url:{
       type:Sequelize.STRING
   },
   userId:{
       type:Sequelize.INTEGER
   },
   src:{
       type:Sequelize.STRING
   },
    desc:{
      type:Sequelize.STRING
    },
    programId:{
        type:Sequelize.STRING
    }

});

SiteCollection.sync({force:false})

module.exports = SiteCollection