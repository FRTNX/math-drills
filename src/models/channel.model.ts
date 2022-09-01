export { };

const { Schema, model } = require('mongoose');

const ChannelSchema = new Schema({
    channel_op: {
        type: Schema.ObjectId,
        ref: 'User',
        required: 'User id is required'
    },
    channel_id: {
        type: String,
        unique: 'channel already exists',
        required: 'channel id is required.'
    },
    passphrase: String,
    visibility: {
        type: String,
        required: 'Visibility setting is required'
    },
    members: {

    },
    welcome_message: {
        type: String
    },
    chown_enabled: {
        type: Boolean,
        default: false
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: Date
});

module.exports = model('Channel', ChannelSchema);
