var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


var index = require('./routes/index');
var users = require('./routes/users');
var application = require('./routes/app');
var article = require('./routes/article');
var upload = require('./routes/upload');
var blog = require('./routes/blog');
var home = require('./routes/home');
var qiniu = require('./routes/qiniuyun');
var question = require('./routes/question');
var site = require('./routes/site');
var api = require('./routes/api');

var app = express();

// var mysql = require('mysql');
//
// var myConnection = require('express-myconnection');
//  var   dbOptions = {
//         host: 'bdm260603158.my3w.com',
//         user: 'bdm260603158',//root用户
//         password: 'xujie19910128',//密码
//         port: 3306,//端口
//         database: 'bdm260603158_db'//数据库
//     };

app.all('*',function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    // res.writeHead(200, {'Content-Type': 'text/plain;charset:utf-8'});




    if (req.method == 'OPTIONS') {
        res.send(200); /让options请求快速返回/
    }
    else {
        next();
    }
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// app.use(myConnection(mysql, dbOptions, 'pool')); //作为中间件来使用

app.use('/', index);
app.use('/users', users);
app.use('/app',application);
app.use('/article',article);
app.use('/upload',upload);
app.use('/blog',blog);
app.use('/api',api);
app.use('/home',home);
app.use('/qiniu',qiniu);
app.use('/question',question);
app.use('/site',site);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
