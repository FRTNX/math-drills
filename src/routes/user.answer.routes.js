const express = require('express');
const authCtrl = require('../controllers/auth.controller');
const userAnswerCtrl = require('../controllers/user.answer.controller');

const router = express.Router();

router.route('/api/v0/user/answer')
    .get(userAnswerCtrl.fetchUserAnswers)
    .post(userAnswerCtrl.saveUserAnswer);

router.route('/api/v0/user/stats')
    .get(userAnswerCtrl.fetchUserStats);

router.route('/api/v0/user/rating')
    .get(userAnswerCtrl.fetchRatingHistory);

module.exports = router;