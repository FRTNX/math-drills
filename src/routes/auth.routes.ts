export { };

const authCtrl = require('../controllers/auth.controller');

const express = require('express');

const router = express.Router();

router.route('/api/v0/auth/signin')
    .post(authCtrl.signin);
router.route('/api/v0/auth/signout')
    .get(authCtrl.signout);

module.exports = router;
