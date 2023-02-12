"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var Channel = require('../models/channel.model');
var User = require('../models/user.model');
var errorHandler = require('./../helpers/db.error.handler');
var create = function (userId, channelId, visibility) { return __awaiter(void 0, void 0, void 0, function () {
    var channel;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                channel = new Channel({
                    channel_op: userId,
                    channel_id: channelId,
                    visibility: visibility
                });
                return [4 /*yield*/, channel.save()];
            case 1:
                _a.sent();
                return [2 /*return*/, { message: 'SUCCESS' }];
        }
    });
}); };
var fetchChannel = function (channelId) { return __awaiter(void 0, void 0, void 0, function () {
    var channel;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Channel.find({ channel_id: channelId })];
            case 1:
                channel = _a.sent();
                console.log('found channel: ', channel);
                return [2 /*return*/, channel];
        }
    });
}); };
var publishChannel = function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var channelId, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                channelId = request.query.channel_id;
                return [4 /*yield*/, Channel.findOneAndUpdate({ channel_id: channelId }, { visibility: 'public' })];
            case 1:
                _a.sent();
                return [2 /*return*/, response.json({ result: 'SUCCESS' })];
            case 2:
                error_1 = _a.sent();
                console.log(error_1);
                return [2 /*return*/, response.status(400).json({
                        error: errorHandler.getErrorMessage(error_1)
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
var unPublishChannel = function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var channelId, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                channelId = request.query.channel_id;
                return [4 /*yield*/, Channel.findOneAndUpdate({ channel_id: channelId }, { visibility: 'private' })];
            case 1:
                _a.sent();
                return [2 /*return*/, response.json({ result: 'SUCCESS' })];
            case 2:
                error_2 = _a.sent();
                console.log(error_2);
                return [2 /*return*/, response.status(400).json({
                        error: errorHandler.getErrorMessage(error_2)
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
var listChannels = function (isAdmin) {
    if (isAdmin === void 0) { isAdmin = false; }
    return __awaiter(void 0, void 0, void 0, function () {
        var channels;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isAdmin) return [3 /*break*/, 2];
                    return [4 /*yield*/, Channel.find()];
                case 1: return [2 /*return*/, _a.sent()];
                case 2: return [4 /*yield*/, Channel.find({ visibility: 'public' })];
                case 3:
                    channels = _a.sent();
                    return [2 /*return*/, channels];
            }
        });
    });
};
var listAllChannels = function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var channels, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, Channel.find()];
            case 1:
                channels = _a.sent();
                return [2 /*return*/, response.json(channels)];
            case 2:
                error_3 = _a.sent();
                console.log(error_3);
                return [2 /*return*/, response.status(400).json({
                        error: errorHandler.getErrorMessage(error_3)
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
var isAdmin = function (userId, channelId) { return __awaiter(void 0, void 0, void 0, function () {
    var user, channel, channelOpUserId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, User.findOne({ _id: userId }).select('alias')];
            case 1:
                user = _a.sent();
                if (!channelId) return [3 /*break*/, 3];
                return [4 /*yield*/, Channel.findOne({ channel_id: channelId })];
            case 2:
                channel = _a.sent();
                channelOpUserId = channel.channel_op.toString();
                // todo: return ... || user.is_admin;
                return [2 /*return*/, channelOpUserId === userId || user.alias === 'frtnx'];
            case 3: return [2 /*return*/, user.alias === 'frtnx'];
        }
    });
}); };
var changeChannelOwnership = function (userId, channelId, passphrase) { return __awaiter(void 0, void 0, void 0, function () {
    var channel;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Channel.findOne({ channel_id: channelId })];
            case 1:
                channel = _a.sent();
                if (!channel.chown_enabled) {
                    return [2 /*return*/, { error: 'chown not enabled for this channel.' }];
                }
                ;
                if (!(channel.passphrase === passphrase)) return [3 /*break*/, 3];
                return [4 /*yield*/, Channel.findOneAndUpdate({ channel_id: channelId }, { channel_op: userId })];
            case 2:
                _a.sent();
                return [2 /*return*/, { message: 'SUCCESS' }];
            case 3: return [2 /*return*/, { error: 'invalid credentials.' }];
        }
    });
}); };
var updatePassphrase = function (userId, channelId, oldPassphrase, newPassphrase) { return __awaiter(void 0, void 0, void 0, function () {
    var channel, channelOpUserId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Channel.findOne({ channel_id: channelId })];
            case 1:
                channel = _a.sent();
                channelOpUserId = channel.channel_op.toString();
                if (channelOpUserId !== userId || channel.passphrase !== oldPassphrase) {
                    return [2 /*return*/, { error: 'unauthorized.' }];
                }
                return [4 /*yield*/, Channel.findOneAndUpdate({ channel_id: channelId }, { passphrase: newPassphrase })];
            case 2:
                _a.sent();
                return [2 /*return*/, { message: 'SUCCESS' }];
        }
    });
}); };
var enableChown = function (userId, channelId, passphrase) { return __awaiter(void 0, void 0, void 0, function () {
    var channel, channelOpUserId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Channel.findOne({ channel_id: channelId })];
            case 1:
                channel = _a.sent();
                channelOpUserId = channel.channel_op.toString();
                if (!(channelOpUserId === userId)) return [3 /*break*/, 3];
                return [4 /*yield*/, Channel.findOneAndUpdate({ channel_id: channelId }, { chown_enabled: true, passphrase: passphrase })];
            case 2:
                _a.sent();
                return [2 /*return*/, { message: 'SUCCESS' }];
            case 3: return [2 /*return*/, { error: 'unauthorized.' }];
        }
    });
}); };
var disableChown = function (userId, channelId, passphrase) { return __awaiter(void 0, void 0, void 0, function () {
    var channel, channelOpUserId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Channel.findOne({ channel_id: channelId })];
            case 1:
                channel = _a.sent();
                channelOpUserId = channel.channel_op.toString();
                if (!(channelOpUserId === userId && channel.passphrase === passphrase)) return [3 /*break*/, 3];
                return [4 /*yield*/, Channel.findOneAndUpdate({ channel_id: channelId }, { chown_enabled: false, passphrase: '' })];
            case 2:
                _a.sent();
                return [2 /*return*/, { message: 'SUCCESS' }];
            case 3: return [2 /*return*/, { error: 'invalid credentials.' }];
        }
    });
}); };
var addChannelMember = function (userId, channelId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Channel.findOneAndUpdate({ channel_id: channelId }, { $push: { members: userId } })];
            case 1:
                _a.sent();
                console.log('added new member: ');
                return [2 /*return*/, { result: 'SUCCESS' }];
        }
    });
}); };
var listChannelMembers = function (userId, channelId) { return __awaiter(void 0, void 0, void 0, function () {
    var members;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Channel.findOneAndUpdate({ channel_id: channelId })
                    .select('members')
                    .populate('members', '_id name')
                    .exec()];
            case 1:
                members = _a.sent();
                console.log('members: ', members);
                return [2 /*return*/, members];
        }
    });
}); };
module.exports = {
    create: create,
    fetchChannel: fetchChannel,
    listChannels: listChannels,
    listAllChannels: listAllChannels,
    listChannelMembers: listChannelMembers,
    addChannelMember: addChannelMember,
    publishChannel: publishChannel,
    unPublishChannel: unPublishChannel,
    isAdmin: isAdmin,
    changeChannelOwnership: changeChannelOwnership,
    enableChown: enableChown,
    disableChown: disableChown,
    updatePassphrase: updatePassphrase
};
