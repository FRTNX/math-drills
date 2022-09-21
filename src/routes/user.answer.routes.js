"use strict";
exports.__esModule = true;
var authCtrl = require('../controllers/auth.controller');
var userAnswerCtrl = require('../controllers/user.answer.controller');
var express = require('express');
var router = express.Router();
router.route('/api/v0/user/answer')
    .get(userAnswerCtrl.fetchUserAnswers)
    .post(userAnswerCtrl.saveUserAnswer);
router.route('/api/v0/question/abort')
    .post(userAnswerCtrl.abortQuestion);
module.exports = router;
