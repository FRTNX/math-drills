const express = require('express');
const authCtrl = require('../controllers/auth.controller');
const userCtrl = require('../controllers/user.controller');
const opCtrl = require('../controllers/operations.controller');

const router = express.Router();

router.route('/api/v0/operations')
    .get(opCtrl.fetchQuestion);

router.route('/api/v0/listops')
    .get(opCtrl.listOperations);

// router.param('userId', userCtrl.userByID);

// examples on protecting routes for later
// .put(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.update)
// .delete(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.remove)

module.exports = router;