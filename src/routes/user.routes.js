"use strict";
exports.__esModule = true;
var userCtrl = require('../controllers/user.controller');
var authCtrl = require('../controllers/auth.controller');
var express = require('express');
var router = express.Router();
router.route('/api/v0/users')
    .post(userCtrl.create);
router.route('/api/v0/user/randomized')
    .put(userCtrl.populateOps);
router.route('/api/v0/user/aliases')
    .put(userCtrl.retrofitAliases);
router.route('/api/v0/user/alias')
    .get(userCtrl.fetchUserAlias);
router.route('/count')
    .get(userCtrl.userCount);
router.route('/debug')
    .get(userCtrl.debug);
router.route('/api/v0/photo/:userId')
    .get(userCtrl.photo, userCtrl.defaultPhoto);
router.route('/api/v0/users/defaultphoto')
    .get(userCtrl.defaultPhoto);
router.route('/api/v0/users/:userId')
    .get(authCtrl.requireSignin, userCtrl.read)
    .put(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.update);
router.param('userId', userCtrl.userByID);
module.exports = router;
