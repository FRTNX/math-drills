export { };

const authCtrl = require('../controllers/auth.controller');
const userStatsCtrl = require('../controllers/user.stats.controller');

const express = require('express');

const router = express.Router();

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