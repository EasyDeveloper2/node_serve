/**
 * Created by xujie on 2018/2/21.
 */
/**
 * Created by xujie on 2018/2/5.
 */

var sequelize = require("./sequelize");
var Sequelize = require("sequelize");

const RecommendClassify = sequelize.define("itc_recommendClassify",{
    classifyId:{
        type:Sequelize.INTEGER
    }
});

RecommendClassify.sync({force:false})

module.exports = RecommendClassify
