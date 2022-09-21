"use strict";
exports.__esModule = true;
var authCtrl = require('../controllers/auth.controller');
var userCtrl = require('../controllers/user.controller');
var opCtrl = require('../controllers/operations.controller');
var express = require('express');
var router = express.Router();
router.route('/api/v0/operations')
    .get(opCtrl.fetchQuestion);
router.route('/api/v0/listops')
    .get(opCtrl.listOperations);
router.route('/api/v0/tooltip')
    .get(opCtrl.fetchTooltipMessage);
// router.param('userId', userCtrl.userByID);
// examples on protecting routes for later
// .put(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.update)
// .delete(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.remove)
module.exports = router;
