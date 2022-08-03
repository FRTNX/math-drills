export { };

const authCtrl = require('../controllers/auth.controller');
const userAnswerCtrl = require('../controllers/user.answer.controller');

const express = require('express');

const router = express.Router();

router.route('/api/v0/user/answer')
    .get(userAnswerCtrl.fetchUserAnswers)
    .post(userAnswerCtrl.saveUserAnswer);

router.route('/api/v0/question/abort')
    .post(userAnswerCtrl.abortQuestion);

module.exports = router;