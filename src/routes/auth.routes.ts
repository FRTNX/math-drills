export { };

const authCtrl = require('../controllers/auth.controller');
const userCtrl = require('../controllers/user.controller');

const express = require('express');

const router = express.Router();

router.route('/api/v0/auth/signin')
    .post(authCtrl.signin);
router.route('/api/v0/auth/signout')
    .get(authCtrl.signout);
router.route('/api/v0/auth/anonymous')
    .post(userCtrl.anonymousLogin);

module.exports = router;
