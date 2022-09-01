export { };

const { config } = require('./../config/config');

const channelMsgCtrl = require('./controllers/channel.message.controller');

const mongoose = require('mongoose');

const WebSocket = require('ws');
const http = require('http');

const got = require('got');
const app = require('./express');

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = new Map();

// large refactor due in this file. this is just a dirty hack to
// get everything running. so far, it gets the job done. function before beauty :)
const splitLines = (text: string, limit: number = 55): Array<string> => {
    let line: string = '';

    const lines: Array<string> = [];

    const wordsArray: Array<string> = text.split(' ');

    wordsArray.map((word, index) => {
        let newLine: string = `${line} ${word}`;
        const isLastWord: boolean = index === wordsArray.length - 1;
        if (newLine.length > limit || isLastWord) {
            isLastWord ? lines.push(newLine) : lines.push(line);
            line = word;
        }

        if (newLine.length <= limit) {
            line = newLine;
        }
    });

    return lines
};

wss.on('connection', (ws) => {
    try {
        ws.on('message', (message: string) => {
            console.log('socket recieved: ', message);
            const parsedMessage = JSON.parse(message);
            const messageType = parsedMessage.message_type;
    
            if (messageType === 'init') {
                const client = parsedMessage.data;
    
                const pingIntervalId = setInterval(() => {
                    console.log('sending out socket ping')
                    ws.send(JSON.stringify({
                        channel_id: '',
                        user_id: '',
                        lines: ['ping']
                    }));
    
                    // keep heroku from idling while a socket is open
                    got(config.serverPingUrl);
                }, 10000);
    
                client.pingIntervalId = pingIntervalId;
    
                // client sockets are broken when heroku idles, even though server 
                // sockets are still up (albiet unreachable)
                // so when the user tries to rejoin a channel remove their previous socket
                // to prevent them getting double subscribed. to be observed
                for (const [activeSocket, activeClient] of clients) {
                    if (activeClient.user_id && activeClient.user_id === client.user_id) {
                        console.log('found stale socket. removing')
                        clients.delete(activeSocket);
                    }
                }
    
                clients.set(ws, client);
    
                // broadcast join message
                for (const [ws, client] of clients) {
                    if (client.channel_id === parsedMessage.data.channel_id) {
                        ws.send(JSON.stringify({
                            channel_id: parsedMessage.data.channel_id,
                            alias: parsedMessage.data.alias,
                            lines: [`joined channel.`]
                        }))
                    }
                }
    
                channelMsgCtrl.appendChannelMessage(parsedMessage.data.user_id, 'joined channel.', parsedMessage.data.channel_id);
            }
    
            if (messageType === 'channel_msg') {
                const userId = parsedMessage.data.user_id;
                const alias = parsedMessage.data.alias;
                const channelId = parsedMessage.data.channel_id;
    
                let userInput = parsedMessage.data.user_input;
    
                const exitCommands = ['/exit', 'exit'];
    
                // eventually move this logic accordingly
                if (exitCommands.includes(userInput.toLowerCase().trim())) {
                    const client = clients.get(ws);
    
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
                    clients.delete(ws);
                }
    
                // persist message
                channelMsgCtrl.appendChannelMessage(userId, userInput, channelId);
    
                // broadcast to other online users in channel
                for (const [ws, client] of clients) {
                    if (client.channel_id === channelId && !userInput.startsWith('/')) {
                        ws.send(JSON.stringify({
                            channel_id: channelId,
                            alias: alias,
                            lines: splitLines(userInput)
                        }));
                    }
                }
            }
        });
    
        // on client disconnection
        ws.on('close', () => {
            let client = clients.get(ws);
            if (client) {
                const userId = client.user_id || '';
    
                if (client.pingIntervalId) {
                    clearInterval(client.pingIntervalId);
                }
    
                clients.delete(ws);
    
                channelMsgCtrl.appendChannelMessage(userId, 'disconnected.', client.channel_id);
    
                for (const [ws, messageData] of clients) {
                    if (messageData.channel_id === client.channel_id) {
                        ws.send(JSON.stringify({
                            channel_id: client.channel_id,
                            user_id: userId,
                            lines: ['disconnected.']
                        }))
                    }
                }
            }
    
            else {
                clients.delete(ws);
            }
        });
    } catch (error) {
        console.log(error);
    }
});

mongoose.Promise = global.Promise;
mongoose.connect(config.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on('error', () => {
    throw new Error(`Unable to connect to database: ${config.mongoUri}`)
});

server.listen(config.port, (error) => {
    if (error) {
        console.log(error);
    } else {
        console.log(`Server running on http://localhost:${config.port}/`);
    }
});
