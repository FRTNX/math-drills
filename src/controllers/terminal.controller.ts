export { };

const { config } = require('./../../config/config');

const Channel = require('../models/channel.model');
const ChannelMessage = require('../models/channel.message.model');

const channelCtrl = require('./channel.controller');
const channelMsgCtrl = require('./channel.message.controller');

const errorHandler = require('./../helpers/db.error.handler');

import { IRequest, IResponse } from './controller.types';

const got = require('got');

// todo: move to helpers
const splitLines = (text: string, limit: number = 60): Array<string> => {
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

const evaluateInputType = (userInput: string): string => {
    if (userInput.startsWith('/')) {
        return 'CHANNEL_CMD';
    }

    if (userInput === 'help') {
        return 'HELP_REQUEST';
    }

    return 'GENERIC';
};

const formatChannelMessages = (messages) => {
    const messageArrays = messages.map((message) => {
        const text = message.text.trim() === '/exit'
            ? 'left channel.'
            : message.text;

        const userId = message.user_id.toString();
        return splitLines(`${userId.slice(userId.length - 5)} > ${text}`)
    });

    const unifiedArray = messageArrays.reduce((messages, messageArray) => [...messages, ...messageArray], []);
    return unifiedArray.map((message: string) => message.replace(/\s+/g, ' ').trim());
};

const handleChannelCmd = async (userId: string, userInput: string, channelId?: string): Promise<any> => {

    if (userInput.toLowerCase() === '/list channels') {
        const channels = await channelCtrl.listChannels();

        const channelList = channels.map((channel: any) => `    ${channel.channel_id}`);

        return {
            state: {
                mode: 'default',
                prompt: '$',
            },
            lines: [
                " public channels:",
                ...channelList
            ]
        };
    }

    if (userInput.toLowerCase() === '/exit') {
        return {
            state: {
                mode: 'default',
                prompt: '$',
                channel_id: ''
            },
            lines: [
                " exited channel."
            ]
        };
    }

    if (userInput.toLowerCase().startsWith('/join ')) {
        const [cmd, channelId] = userInput.split(' ');

        const channelExists: boolean = await Channel.exists({ channel_id: channelId });

        if (channelExists) {
            const msgCount: number = await ChannelMessage.count({ channel_id: channelId });

            const channelMessages = await channelMsgCtrl.fetchChannelMessages(channelId, 0);

            const formattedMessages = formatChannelMessages(channelMessages);

            // todo: check and update channel membership if necessary

            return {
                state: {
                    mode: 'channel',
                    prompt: `(${channelId})$`,
                    channel_id: channelId,
                    channel_msg_count: msgCount
                },
                lines: [
                    ` you are now in #${channelId}.`,
                    ...formattedMessages
                ]
            }
        }

        if (!channelExists) {
            await channelCtrl.create(userId, channelId, 'private')

            return {
                state: {
                    mode: 'channel',
                    prompt: `(${channelId})$`,
                    channel_id: channelId,
                    channel_msg_count: 0
                },
                lines: [
                    ` you are now in #${channelId}.`
                ]
            }
        }
    }
};

const handleInput = async (userId: string, userInput: string, inputType: string): Promise<any> => {
    if (inputType === 'HELP_REQUEST') {
        const lines: Array<string> = [
            ' math drills help menu',
            '  /LIST channels      -> list available chat channels.',
            '  /JOIN #channel-name -> join a specified channel.',
            '  /EXIT               -> exit the current channel.',
            '  /HELP               -> show a channel specific help menu',
            '  help                -> show this help menu.',
            '  clear               -> clear all terminal output.',
            "any other input that isn't a command will be processed",
            "by DrillBot."
        ];

        return {
            lines,
            state: {
                mode: 'default'
            }
        };
    };

    if (inputType === 'CHANNEL_CMD') {
        const { lines, state } = await handleChannelCmd(userId, userInput);
        return { lines, state };
    }

    const result = await got(`${config.drillBotServer}?text=${userInput}&&sessionId=${userId}`);
    const lines = splitLines(JSON.parse(result.body));

    return {
        lines,
        state: {
            mode: 'default'
        }
    };
};

const handleChannelInput =  async (userId: string, userInput: string, channelId: string, msgCount: number) => {
    await channelMsgCtrl.appendChannelMessage(userId, userInput, channelId);

    const channelMessages = await channelMsgCtrl.fetchChannelMessages(channelId, msgCount);
    console.log('new channel messages: ', channelMessages)

    return {
        lines: formatChannelMessages(channelMessages),
        state: {}
    }
};

const processTerminalInput = async (request: IRequest, response: IResponse): Promise<IResponse> => {
    try {
        const userId: string = request.query.user_id;

        const userInput: string = request.query.input;

        const inputType: string = evaluateInputType(userInput);

        // direct user input at a channel
        if (inputType ==='GENERIC' && request.query.channel_id) {
            const channelId = request.query.channel_id;
            const msgCount = request.query.msg_count;

            const { lines, state } = await handleChannelInput(userId, userInput, channelId, msgCount);

            return response.json({ lines, state });
        }

        const { lines, state } = await handleInput(userId, userInput, inputType);

        return response.json({ lines, state });
    } catch (error) {
        console.log(error)
        return response.status(400).json({
            error: errorHandler.getErrorMessage(error)
        });
    }
};

const ping = async (request, response) => {
    console.log('got server ping')
    return response.json('pong');
};

module.exports = {
    processTerminalInput,
    ping
};
