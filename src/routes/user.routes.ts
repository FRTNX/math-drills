export { };

const userCtrl = require('../controllers/user.controller');
const authCtrl = require('../controllers/auth.controller');

const express = require('express');

const router = express.Router();

router.route('/api/v0/users')
    .post(userCtrl.create);

router.route('/api/v0/user/randomized')
    .put(userCtrl.populateOps);

router.route('/count')
    .get(userCtrl.userCount);

router.route('/api/v0/photo/:userId')
    .get(userCtrl.photo, userCtrl.defaultPhoto);
router.route('/api/v0/users/defaultphoto')
    .get(userCtrl.defaultPhoto);

router.route('/api/v0/users/:userId')
    .get(authCtrl.requireSignin, userCtrl.read)
    .put(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.update);

router.param('userId', userCtrl.userByID);

module.exports = router;
