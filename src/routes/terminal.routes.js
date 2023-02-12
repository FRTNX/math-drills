"use strict";
exports.__esModule = true;
var trmCtrl = require('../controllers/terminal.controller');
var express = require('express');
var router = express.Router();
router.route('/api/v0/terminal')
    .get(trmCtrl.processTerminalInput);
router.route('/api/v0/ping')
    .get(trmCtrl.ping);
module.exports = router;
