"use strict";
exports.__esModule = true;
var _a = require('mongoose'), Schema = _a.Schema, model = _a.model;
var ChannelMessageSchema = new Schema({
    user_id: {
        type: Schema.ObjectId,
        ref: 'User',
        required: 'User id is required'
    },
    user_alias: {
        type: String,
        required: 'User alias is required'
    },
    channel_id: {
        type: String,
        required: 'channel id is required.'
    },
    text: {
        type: String,
        required: 'message is required'
    },
    created: {
        type: Date,
        "default": Date.now
    }
});
module.exports = model('ChannelMessage', ChannelMessageSchema);
