/**
 * Created by xujie on 2018/2/5.
 */

const Sequelize = require('sequelize');
const config = require('../config/config');

const sequelize = new Sequelize(config.dbName, config.dbUsername, config.dbPassword, {
    host: config.dbHost,
    dialect: 'mysql',
    dialectOptions: {
        charset: 'utf8'
    },
    pool: {
        max: 5000,
        min: 0,
        acquire: 30000,
        idle: 10000
    },

    // SQLite only
    //  storage: 'path/to/database.sqlite'
});

module.exports = sequelize;
//
// sequelize
//     .authenticate()
//     .then(function(){
//         console.log('Connection has been established successfully.');
//     })
//     .catch(function(err){
//         console.error('Unable to connect to the database:', err);
//     });
