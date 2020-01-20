/**
 * Created by xujie on 2018/2/5.
 */

var sequelize = require("./sequelize");
var Sequelize = require("sequelize");

const Article = sequelize.define("itc_article",{
    title:{
        type:Sequelize.STRING
    },
    desc:{
        type:Sequelize.TEXT
    },
    md:{
        type:Sequelize.STRING
    },
    author:{
        type:Sequelize.STRING
    },
    isDelete:{
        type:Sequelize.STRING
    },
    classfyId:{
       type:Sequelize.STRING
     },
    userId:{
        type:Sequelize.STRING
    },
    publish:{
        type:Sequelize.INTEGER
    },
    readCount:{
        type:Sequelize.INTEGER
    }
});

Article.sync({force:false})

module.exports = Article
