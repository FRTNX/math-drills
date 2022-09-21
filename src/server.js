"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
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
exports.__esModule = true;
var config = require('./../config/config').config;
var channelMsgCtrl = require('./controllers/channel.message.controller');
var mongoose = require('mongoose');
var WebSocket = require('ws');
var http = require('http');
var got = require('got');
var app = require('./express');
var server = http.createServer(app);
var wss = new WebSocket.Server({ server: server });
var clients = new Map();
// large refactor due in this file. this is just a dirty hack to
// get everything running. so far, it gets the job done. function before beauty :)
var splitLines = function (text, limit) {
    if (limit === void 0) { limit = 55; }
    var line = '';
    var lines = [];
    var wordsArray = text.split(' ');
    wordsArray.map(function (word, index) {
        var newLine = line + " " + word;
        var isLastWord = index === wordsArray.length - 1;
        if (newLine.length > limit || isLastWord) {
            isLastWord ? lines.push(newLine) : lines.push(line);
            line = word;
        }
        if (newLine.length <= limit) {
            line = newLine;
        }
    });
    return lines;
};
wss.on('connection', function (ws) {
    try {
        ws.on('message', function (message) {
            var e_1, _a, e_2, _b, e_3, _c;
            console.log('socket recieved: ', message);
            var parsedMessage = JSON.parse(message);
            var messageType = parsedMessage.message_type;
            if (messageType === 'init') {
                var client = parsedMessage.data;
                var pingIntervalId = setInterval(function () {
                    console.log('sending out socket ping');
                    ws.send(JSON.stringify({
                        channel_id: '',
                        user_id: '',
                        lines: ['ping']
                    }));
                    // keep heroku from idling while a socket is open
                    got(config.serverPingUrl);
                }, 10000);
                client.pingIntervalId = pingIntervalId;
                try {
                    // client sockets are broken when heroku idles, even though server 
                    // sockets are still up (albiet unreachable)
                    // so when the user tries to rejoin a channel remove their previous socket
                    // to prevent them getting double subscribed. to be observed
                    for (var clients_1 = __values(clients), clients_1_1 = clients_1.next(); !clients_1_1.done; clients_1_1 = clients_1.next()) {
                        var _d = __read(clients_1_1.value, 2), activeSocket = _d[0], activeClient = _d[1];
                        if (activeClient.user_id && activeClient.user_id === client.user_id) {
                            console.log('found stale socket. removing');
                            clients["delete"](activeSocket);
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (clients_1_1 && !clients_1_1.done && (_a = clients_1["return"])) _a.call(clients_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                clients.set(ws, client);
                try {
                    // broadcast join message
                    for (var clients_2 = __values(clients), clients_2_1 = clients_2.next(); !clients_2_1.done; clients_2_1 = clients_2.next()) {
                        var _e = __read(clients_2_1.value, 2), ws_1 = _e[0], client_1 = _e[1];
                        if (client_1.channel_id === parsedMessage.data.channel_id) {
                            ws_1.send(JSON.stringify({
                                channel_id: parsedMessage.data.channel_id,
                                alias: parsedMessage.data.alias,
                                lines: ["joined channel."]
                            }));
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (clients_2_1 && !clients_2_1.done && (_b = clients_2["return"])) _b.call(clients_2);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                channelMsgCtrl.appendChannelMessage(parsedMessage.data.user_id, 'joined channel.', parsedMessage.data.channel_id);
            }
            if (messageType === 'channel_msg') {
                var userId = parsedMessage.data.user_id;
                var alias = parsedMessage.data.alias;
                var channelId = parsedMessage.data.channel_id;
                var userInput = parsedMessage.data.user_input;
                var exitCommands = ['/exit', 'exit'];
                // eventually move this logic accordingly
                if (exitCommands.includes(userInput.toLowerCase().trim())) {
                    var client = clients.get(ws);
                    userInput = 'left channel.';
                    ws.send(JSON.stringify({
                        channel_id: channelId,
                        alias: alias,
                        lines: ['left channel.'],
                        state: {
                            mode: 'default',
                            prompt: '$',
                            channel_id: '',
                            channel_msg_count: null,
                            ws: null
                        }
                    }));
                    // stop socket maintanance ops
                    clearInterval(client.pingIntervalId);
                    // remove user client
                    clients["delete"](ws);
                }
                // persist message
                channelMsgCtrl.appendChannelMessage(userId, userInput, channelId);
                try {
                    // broadcast to other online users in channel
                    for (var clients_3 = __values(clients), clients_3_1 = clients_3.next(); !clients_3_1.done; clients_3_1 = clients_3.next()) {
                        var _f = __read(clients_3_1.value, 2), ws_2 = _f[0], client = _f[1];
                        if (client.channel_id === channelId && !userInput.startsWith('/')) {
                            ws_2.send(JSON.stringify({
                                channel_id: channelId,
                                alias: alias,
                                lines: splitLines(userInput)
                            }));
                        }
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (clients_3_1 && !clients_3_1.done && (_c = clients_3["return"])) _c.call(clients_3);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
            }
        });
        // on client disconnection
        ws.on('close', function () {
            var e_4, _a;
            var client = clients.get(ws);
            if (client) {
                var userId = client.user_id || '';
                if (client.pingIntervalId) {
                    clearInterval(client.pingIntervalId);
                }
                clients["delete"](ws);
                channelMsgCtrl.appendChannelMessage(userId, 'disconnected.', client.channel_id);
                try {
                    for (var clients_4 = __values(clients), clients_4_1 = clients_4.next(); !clients_4_1.done; clients_4_1 = clients_4.next()) {
                        var _b = __read(clients_4_1.value, 2), ws_3 = _b[0], messageData = _b[1];
                        if (messageData.channel_id === client.channel_id) {
                            ws_3.send(JSON.stringify({
                                channel_id: client.channel_id,
                                user_id: userId,
                                lines: ['disconnected.']
                            }));
                        }
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (clients_4_1 && !clients_4_1.done && (_a = clients_4["return"])) _a.call(clients_4);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            }
            else {
                clients["delete"](ws);
            }
        });
    }
    catch (error) {
        console.log(error);
    }
});
mongoose.Promise = global.Promise;
mongoose.connect(config.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on('error', function () {
    throw new Error("Unable to connect to database: " + config.mongoUri);
});
server.listen(config.port, function (error) {
    if (error) {
        console.log(error);
    }
    else {
        console.log("Server running on http://localhost:" + config.port + "/");
    }
});
