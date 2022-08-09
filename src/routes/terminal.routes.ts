export { };

const trmCtrl = require('../controllers/terminal.controller');

const express = require('express');

const router = express.Router();

router.route('/api/v0/terminal')
    .get(trmCtrl.processTerminalInput);

module.exports = router;