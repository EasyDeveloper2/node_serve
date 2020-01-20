/**
 * Created by xujie on 2018/2/22.
 */

var express = require('express');
var router = express.Router();
var app = require('../models/app');
var user = require('../models/user');
var errSet = require('./errSet');
var co = require("co")
var config = require("../config/config")
var user = require("../models/user")
var commentArticle = require("../models/commentArticle")






module.exports = router