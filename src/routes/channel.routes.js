"use strict";
exports.__esModule = true;
var channelCtrl = require('../controllers/channel.controller');
var express = require('express');
var router = express.Router();
router.route('/api/v0/channels')
    .get(channelCtrl.listAllChannels);
router.route('/api/v0/channel/publish')
    .post(channelCtrl.publishChannel);
router.route('/api/v0/channel/unpublish')
    .post(channelCtrl.unPublishChannel);
module.exports = router;
