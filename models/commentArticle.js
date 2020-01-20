/**
 * Created by xujie on 2018/2/22.
 */

var sequelize = require("./sequelize");
var Sequelize = require("sequelize");

const CommentArticle = sequelize.define("itc_commentArticle",{
    articleId:{
      type:Sequelize.STRING
    },
    userId:{
      type:Sequelize.INTEGER
    },
    content:{
        type:Sequelize.STRING
    },
});

CommentArticle.sync({force:false})

module.exports = CommentArticle
