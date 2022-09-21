"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
var config = require('./../../config/config').config;
var User = require('../models/user.model');
var Channel = require('../models/channel.model');
var ChannelMessage = require('../models/channel.message.model');
var channelCtrl = require('./channel.controller');
var channelMsgCtrl = require('./channel.message.controller');
var random = require('./../helpers/random');
var errorHandler = require('./../helpers/db.error.handler');
var got = require('got');
// todo: move to helpers
// since the client terminal has no text-wrapping, it is necessary to split
// long lines and limit horizontal scroll. 
var splitLines = function (text, limit) {
    if (limit === void 0) { limit = 60; }
    var line = '';
    var lines = [];
    var wordsArray = text.split(' ');
    wordsArray.map(function (word, index) {
        var newLine = line + " " + word;
        var isLastWord = index === wordsArray.length - 1;
        if ((newLine.length > limit) || isLastWord) {
            isLastWord ? lines.push(newLine) : lines.push(line);
            line = word;
        }
        if (newLine.length <= limit) {
            line = newLine;
        }
    });
    return lines;
};
// todo: move to evaluations.ts
var evaluateInputType = function (userInput) {
    if (userInput.startsWith('/')) {
        return 'CHANNEL_CMD';
    }
    if (userInput === 'help') {
        return 'HELP_REQUEST';
    }
    return 'GENERIC';
};
var formatAlias = function (alias) {
    // let formattedAlias = alias;
    // const spacesToAdd = 5 - alias.length;
    // if (spacesToAdd > 0) {
    //   console.log('adding spaces: ', spacesToAdd)
    //   for (let i = 0; i < spacesToAdd; i ++) {
    //     formattedAlias = formattedAlias + ' ';
    //   }
    // }
    // return formattedAlias;
    return alias;
};
var formatChannelMessages = function (messages) {
    var messageArrays = messages.map(function (message) {
        var text = message.text.trim() === '/exit'
            ? 'left channel.'
            : message.text;
        var userId = message.user_id.toString();
        var header = message.user_alias
            ? message.user_alias
            : userId.slice(userId.length - 5);
        return splitLines(formatAlias(header) + " > " + text);
    });
    var unifiedArray = messageArrays.reduce(function (messages, messageArray) { return __spreadArray(__spreadArray([], __read(messages), false), __read(messageArray), false); }, []);
    return unifiedArray.map(function (message) { return message.replace(/\s+/g, ' ').trim(); });
};
var setUserAttribute = function (userId, attribute, value) { return __awaiter(void 0, void 0, void 0, function () {
    var user, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(attribute === 'alias')) return [3 /*break*/, 5];
                return [4 /*yield*/, User.findOne({ _id: userId })];
            case 1:
                user = _a.sent();
                if (user.is_anonymous) {
                    return [2 /*return*/, { error: 'aliases cannot be set for anonymous users.' }];
                }
                if (value.length > 5) {
                    return [2 /*return*/, { error: "alias too long. max 5 characters." }];
                }
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, User.findOneAndUpdate({ _id: userId }, { alias: value })];
            case 3:
                _a.sent();
                return [2 /*return*/, { alias: value }];
            case 4:
                error_1 = _a.sent();
                console.log(error_1); // 👁: observe
                return [2 /*return*/, { error: 'alias already exists. please choose another.' }];
            case 5: return [2 /*return*/];
        }
    });
}); };
var handleChannelCmd = function (userId, userInput, channelId) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, cmd, attribute, isAdmin, channels, channelList, users, userList, _b, cmd, targetChannel, targetUser, isChannelAdmin, _c, cmd, attribute, value, updatedValues, inputArray, _d, cmd, channelId_1, passphrase, result, _e, cmd, operator, channelId_2, passphrase, result, _f, cmd, operator, channelId_3, oldPassphrase, newPassphrase, result, _g, cmd, operator, channelId_4, passphrase, result, _h, cmd, channelId_5, channelExists, banners, selectedBanner, channelBanner, iching, trigram, msgCount, channelMessages, formattedMessages, error_2;
    return __generator(this, function (_j) {
        switch (_j.label) {
            case 0:
                _j.trys.push([0, 36, , 37]);
                if (!userInput.toLowerCase().startsWith('/list ')) return [3 /*break*/, 5];
                _a = __read(userInput.split(' '), 2), cmd = _a[0], attribute = _a[1];
                if (!attribute) {
                    throw new Error("Invalid input: " + userInput);
                }
                return [4 /*yield*/, channelCtrl.isAdmin(userId)];
            case 1:
                isAdmin = _j.sent();
                if (!(attribute === 'channels')) return [3 /*break*/, 3];
                return [4 /*yield*/, channelCtrl.listChannels(isAdmin)];
            case 2:
                channels = _j.sent();
                channelList = channels.map(function (channel) { return "  " + channel.channel_id; });
                return [2 /*return*/, {
                        state: {
                            mode: 'default',
                            prompt: '$'
                        },
                        lines: __spreadArray([
                            isAdmin
                                ? "public channels:"
                                : "all channels:"
                        ], __read(channelList), false)
                    }];
            case 3:
                if (!(attribute === 'users')) return [3 /*break*/, 5];
                if (!isAdmin) {
                    throw new Error("Unauthorized: " + userInput);
                }
                return [4 /*yield*/, User.find().select('name email created')];
            case 4:
                users = _j.sent();
                userList = users.map(function (user) { return "  " + user.name + ", " + user.email + ", " +
                    ("" + user.created.toString().slice(0, 15)); });
                return [2 /*return*/, {
                        state: {
                            mode: 'default',
                            prompt: '$'
                        },
                        lines: __spreadArray([
                            "users(" + userList.length + "):"
                        ], __read(userList), false)
                    }];
            case 5:
                if (userInput.toLowerCase() === '/exit') {
                    if (!channelId) {
                        return [2 /*return*/, handleInput(userId, userInput, 'GENERIC')];
                    }
                    return [2 /*return*/, {
                            state: {
                                mode: 'default',
                                prompt: '$',
                                channel_id: '',
                                ws: null
                            },
                            lines: [
                                "left channel."
                            ]
                        }];
                }
                if (!userInput.toLowerCase().startsWith('/nuke')) return [3 /*break*/, 11];
                _b = __read(userInput.split(' '), 3), cmd = _b[0], targetChannel = _b[1], targetUser = _b[2];
                if (!targetChannel) {
                    return [2 /*return*/, {
                            lines: ['target not specified.']
                        }];
                }
                return [4 /*yield*/, channelCtrl.isAdmin(userId, targetChannel)];
            case 6:
                isChannelAdmin = _j.sent();
                if (!isChannelAdmin) {
                    // let drillbot handle the request
                    return [2 /*return*/, handleInput(userId, userInput, 'GENERIC')];
                }
                if (!targetUser) return [3 /*break*/, 8];
                return [4 /*yield*/, channelMsgCtrl.nukeUserMessages(userId, targetChannel, targetUser)];
            case 7:
                _j.sent();
                return [3 /*break*/, 10];
            case 8: return [4 /*yield*/, channelMsgCtrl.nukeChannelMessages(userId, targetChannel)];
            case 9:
                _j.sent();
                _j.label = 10;
            case 10: return [2 /*return*/, {
                    lines: [
                        targetUser
                            ? "nuked " + targetUser + " from #" + targetChannel + "."
                            : "nuked all messages in #" + targetChannel + "."
                    ]
                }];
            case 11:
                if (!userInput.toLowerCase().startsWith('/set ')) return [3 /*break*/, 13];
                _c = __read(userInput.split(' '), 3), cmd = _c[0], attribute = _c[1], value = _c[2];
                return [4 /*yield*/, setUserAttribute(userId, attribute, value)];
            case 12:
                updatedValues = _j.sent();
                if (updatedValues.error) {
                    return [2 /*return*/, {
                            lines: [updatedValues.error]
                        }];
                }
                ;
                return [2 /*return*/, {
                        user: __assign({}, updatedValues),
                        lines: [
                            attribute + " successfully set to " + value + "."
                        ]
                    }];
            case 13:
                if (!userInput.toLowerCase().startsWith('/chown')) return [3 /*break*/, 28];
                inputArray = userInput.split(' ');
                if (!(inputArray.length === 3)) return [3 /*break*/, 15];
                _d = __read(inputArray, 3), cmd = _d[0], channelId_1 = _d[1], passphrase = _d[2];
                return [4 /*yield*/, channelCtrl.changeChannelOwnership(userId, channelId_1, passphrase)];
            case 14:
                result = _j.sent();
                if (result.error) {
                    return [2 /*return*/, {
                            lines: [result.error]
                        }];
                }
                if (result.message === 'SUCCESS') {
                    return [2 /*return*/, {
                            lines: ["you now own #" + channelId_1 + "."]
                        }];
                }
                throw new Error("invalid chown result: " + result);
            case 15:
                if (!(inputArray[1] == 'enable')) return [3 /*break*/, 19];
                _e = __read(inputArray, 4), cmd = _e[0], operator = _e[1], channelId_2 = _e[2], passphrase = _e[3];
                if (!!passphrase) return [3 /*break*/, 17];
                return [4 /*yield*/, handleInput(userId, userInput, 'GENERIC')];
            case 16: return [2 /*return*/, _j.sent()];
            case 17: return [4 /*yield*/, channelCtrl.enableChown(userId, channelId_2, passphrase)];
            case 18:
                result = _j.sent();
                if (result.error) {
                    return [2 /*return*/, {
                            lines: [result.error]
                        }];
                }
                if (result.message === 'SUCCESS') {
                    return [2 /*return*/, {
                            lines: ["chown enabled."]
                        }];
                }
                throw new Error("invalid chown result: " + result);
            case 19:
                if (!(inputArray[1] == 'upwd')) return [3 /*break*/, 23];
                _f = __read(inputArray, 5), cmd = _f[0], operator = _f[1], channelId_3 = _f[2], oldPassphrase = _f[3], newPassphrase = _f[4];
                if (!(!oldPassphrase || !newPassphrase)) return [3 /*break*/, 21];
                return [4 /*yield*/, handleInput(userId, userInput, 'GENERIC')];
            case 20: return [2 /*return*/, _j.sent()];
            case 21: return [4 /*yield*/, channelCtrl.updatePassphrase(userId, channelId_3, oldPassphrase, newPassphrase)];
            case 22:
                result = _j.sent();
                if (result.error) {
                    return [2 /*return*/, {
                            lines: [result.error]
                        }];
                }
                if (result.message === 'SUCCESS') {
                    return [2 /*return*/, {
                            lines: ["chown passphrase updated."]
                        }];
                }
                throw new Error("invalid chown result: " + result);
            case 23:
                if (!(inputArray[1] == 'disable')) return [3 /*break*/, 27];
                _g = __read(inputArray, 4), cmd = _g[0], operator = _g[1], channelId_4 = _g[2], passphrase = _g[3];
                if (!!passphrase) return [3 /*break*/, 25];
                return [4 /*yield*/, handleInput(userId, userInput, 'GENERIC')];
            case 24: return [2 /*return*/, _j.sent()];
            case 25: return [4 /*yield*/, channelCtrl.disableChown(userId, channelId_4, passphrase)];
            case 26:
                result = _j.sent();
                if (result.error) {
                    return [2 /*return*/, {
                            lines: [result.error]
                        }];
                }
                if (result.message === 'SUCCESS') {
                    return [2 /*return*/, {
                            lines: ["chown disabled."]
                        }];
                }
                throw new Error("invalid chown result: " + result);
            case 27:
                // chown help menu
                if (inputArray[1] === 'help') {
                    return [2 /*return*/, {
                            lines: [
                                'chown (ch-ange own-ership) menu',
                                '* for channel admins/owners',
                                '  /CHOWN enable channel_name PWD  => enable chown for channel and set password.',
                                '  /CHOWN disable channel_name PWD => disable chown for channel.',
                                '  /CHOWN channel_name PWD         => change channel ownership to current user.',
                                '  /CHOWN upwd channel_name OLDPWD NEWPWD => change chown password.',
                            ]
                        }];
                }
                throw new Error("invalid command: " + userInput);
            case 28:
                ;
                if (!userInput.toLowerCase().startsWith('/join')) return [3 /*break*/, 35];
                _h = __read(userInput.split(' '), 2), cmd = _h[0], channelId_5 = _h[1];
                if (!channelId_5) {
                    return [2 /*return*/, {
                            lines: ['channel not specified.']
                        }];
                }
                return [4 /*yield*/, Channel.exists({ channel_id: channelId_5 })];
            case 29:
                channelExists = _j.sent();
                banners = ['iching', 'default'];
                selectedBanner = banners[random(0, banners.length)];
                channelBanner = void 0;
                if (selectedBanner === 'iching') {
                    iching = [
                        [''],
                        ['           ############', '           ####    ####'],
                        ['           ############', '           ####    ####'],
                        ['           ############', '           ####    ####'],
                        ['']
                    ];
                    trigram = iching.reduce(function (trigram, values) {
                        var value = values[random(0, values.length)];
                        return __spreadArray(__spreadArray([], __read(trigram), false), [value, value], false);
                    }, []);
                    // for the logs :)
                    console.log(trigram);
                    channelBanner = trigram;
                }
                if (selectedBanner === 'default') {
                    channelBanner = [
                        '',
                        '       ',
                        '        ^      ☯       ^       ',
                        '     <       DRILLS       > ',
                        '         .            .',
                        '            ~  --  ~',
                        ''
                    ];
                }
                if (!channelExists) return [3 /*break*/, 32];
                return [4 /*yield*/, ChannelMessage.count({ channel_id: channelId_5 })];
            case 30:
                msgCount = _j.sent();
                return [4 /*yield*/, channelMsgCtrl.fetchChannelMessages(channelId_5, 0)];
            case 31:
                channelMessages = _j.sent();
                formattedMessages = formatChannelMessages(channelMessages);
                // todo: check and update channel membership if necessary
                return [2 /*return*/, {
                        state: {
                            mode: 'channel',
                            prompt: "(" + channelId_5 + ")$",
                            channel_id: channelId_5,
                            channel_msg_count: msgCount
                        },
                        lines: __spreadArray(__spreadArray([
                            " you are now in #" + channelId_5 + "."
                        ], __read(channelBanner), false), __read(formattedMessages), false)
                    }];
            case 32:
                if (!!channelExists) return [3 /*break*/, 34];
                return [4 /*yield*/, channelCtrl.create(userId, channelId_5, 'private')];
            case 33:
                _j.sent();
                return [2 /*return*/, {
                        state: {
                            mode: 'channel',
                            prompt: "(" + channelId_5 + ")$",
                            channel_id: channelId_5,
                            channel_msg_count: 0
                        },
                        lines: __spreadArray([
                            " you are now in #" + channelId_5 + "."
                        ], __read(channelBanner), false)
                    }];
            case 34:
                ;
                _j.label = 35;
            case 35: throw new Error("Unrecognized command: " + userInput);
            case 36:
                error_2 = _j.sent();
                console.log(error_2);
                return [2 /*return*/, handleInput(userId, userInput, 'GENERIC')];
            case 37: return [2 /*return*/];
        }
    });
}); };
var handleInput = function (userId, userInput, inputType) { return __awaiter(void 0, void 0, void 0, function () {
    var lines_1, _a, lines_2, state, user, result, lines;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (inputType === 'HELP_REQUEST') {
                    lines_1 = [
                        ' math drills help menu',
                        '  /SET alias your_alias => set a new alias, replace ',
                        '                           "your_alias" with your desired alias.',
                        '                           /set alias only works outside channels.',
                        '  /LIST channels        => list public chat channels.',
                        '  /JOIN channel_name    => join a specified channel. replace channel_name',
                        '                           with your desired channel. if the channel does not',
                        '                           exist, it will be created with you as the op.',
                        '                           new channels are private by default.',
                        '  /CHOWN help           => view the chown (ch-ange [channel] own-ership) menu.',
                        '  /EXIT                 => exit the current channel.',
                        '  /HELP                 => (incoming) show a channel specific help menu',
                        '  help                  => show this help menu.',
                        '  clear                 => clear all terminal output.',
                        "any other input outside a channel that isn't a command will be processed",
                        "by drillbot."
                    ];
                    return [2 /*return*/, {
                            state: {
                                mode: 'default'
                            },
                            lines: lines_1
                        }];
                }
                ;
                if (!(inputType === 'CHANNEL_CMD')) return [3 /*break*/, 2];
                return [4 /*yield*/, handleChannelCmd(userId, userInput)];
            case 1:
                _a = _b.sent(), lines_2 = _a.lines, state = _a.state, user = _a.user;
                return [2 /*return*/, { lines: lines_2, state: state, user: user }];
            case 2: return [4 /*yield*/, got(config.drillBotServer + "?text=" + userInput + "&&sessionId=" + userId)];
            case 3:
                result = _b.sent();
                lines = splitLines(JSON.parse(result.body));
                return [2 /*return*/, {
                        state: {
                            mode: 'default'
                        },
                        lines: lines
                    }];
        }
    });
}); };
var processTerminalInput = function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, userInput, inputType, _a, lines, state, user, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                userId = request.query.user_id;
                userInput = request.query.input;
                inputType = evaluateInputType(userInput);
                return [4 /*yield*/, handleInput(userId, userInput, inputType)];
            case 1:
                _a = _b.sent(), lines = _a.lines, state = _a.state, user = _a.user;
                return [2 /*return*/, response.json({ lines: lines, state: state, user: user })];
            case 2:
                error_3 = _b.sent();
                console.log(error_3);
                return [2 /*return*/, response.status(400).json({
                        error: errorHandler.getErrorMessage(error_3)
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
var ping = function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        console.log('got server ping');
        return [2 /*return*/, response.json('pong')];
    });
}); };
module.exports = {
    processTerminalInput: processTerminalInput,
    ping: ping
};
