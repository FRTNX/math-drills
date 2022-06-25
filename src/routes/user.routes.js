const express = require('express');
const userCtrl = require('../controllers/user.controller');
const authCtrl = require('../controllers/auth.controller');

const router = express.Router();

router.route('/api/v0/users')
    .get(userCtrl.list)
    .post(userCtrl.create); 

router.route('/count')
    .get(userCtrl.userCount);

router.route('/api/v0/photo/:userId')
    .get(userCtrl.photo, userCtrl.defaultPhoto);
router.route('/api/v0/users/defaultphoto')
    .get(userCtrl.defaultPhoto);

router.route('/api/v0/users/follow')
    .put(authCtrl.requireSignin, userCtrl.addFollowing, userCtrl.addFollower);
router.route('/api/v0/api/users/unfollow')
    .put(authCtrl.requireSignin, userCtrl.removeFollowing, userCtrl.removeFollower);

router.route('/api/v0/users/findpeople/:userId')
    .get(authCtrl.requireSignin, userCtrl.findPeople);

router.route('/api/v0/users/:userId')
    .get(authCtrl.requireSignin, userCtrl.read)
    .put(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.update)
    .delete(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.remove);

router.param('userId', userCtrl.userByID);

module.exports = router;
