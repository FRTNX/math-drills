"use strict";
exports.__esModule = true;
var authCtrl = require('../controllers/auth.controller');
var userCtrl = require('../controllers/user.controller');
var express = require('express');
var router = express.Router();
router.route('/api/v0/auth/signin')
    .post(authCtrl.signin);
router.route('/api/v0/auth/signout')
    .get(authCtrl.signout);
router.route('/api/v0/auth/anonymous')
    .post(userCtrl.anonymousLogin);
module.exports = router;
