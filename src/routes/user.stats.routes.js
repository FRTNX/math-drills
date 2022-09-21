"use strict";
exports.__esModule = true;
var authCtrl = require('../controllers/auth.controller');
var userStatsCtrl = require('../controllers/user.stats.controller');
var express = require('express');
var router = express.Router();
router.route('/api/v0/user/stats')
    .get(userStatsCtrl.fetchUserStats);
router.route('/api/v0/user/allstats')
    .get(userStatsCtrl.compileStats);
router.route('/api/v0/user/ops')
    .get(userStatsCtrl.fetchActiveOps);
router.route('/api/v0/user/rating')
    .get(userStatsCtrl.fetchRatingHistory);
router.route('/api/v0/user/speed')
    .get(userStatsCtrl.fetchSpeedStats);
module.exports = router;
