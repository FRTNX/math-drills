export { };

const { config } = require('./../../config/config');

const User = require('../models/user.model');

const Channel = require('../models/channel.model');
const ChannelMessage = require('../models/channel.message.model');

const channelCtrl = require('./channel.controller');
const channelMsgCtrl = require('./channel.message.controller');

const random = require('./../helpers/random');
const errorHandler = require('./../helpers/db.error.handler');

import { IRequest, IResponse } from './controller.types';

const got = require('got');

// todo: move to helpers
// since the client terminal has no text-wrapping, it is necessary to split
// long lines and limit horizontal scroll. 
const splitLines = (text: string, limit: number = 60): Array<string> => {
    let line: string = '';

    const lines: Array<string> = [];

    const wordsArray: Array<string> = text.split(' ');

    wordsArray.map((word, index) => {
        let newLine: string = `${line} ${word}`;

        const isLastWord: boolean = index === wordsArray.length - 1;

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
const evaluateInputType = (userInput: string): string => {
    if (userInput.startsWith('/')) {
        return 'CHANNEL_CMD';
    }

    if (userInput === 'help') {
        return 'HELP_REQUEST';
    }

    return 'GENERIC';
};

const formatAlias = (alias: string): string => {
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

const formatChannelMessages = (messages) => {
    const messageArrays = messages.map((message) => {
        const text = message.text.trim() === '/exit'
            ? 'left channel.'
            : message.text;

        const userId = message.user_id.toString();

        const header = message.user_alias
            ? message.user_alias
            : userId.slice(userId.length - 5);

        return splitLines(`${formatAlias(header)} > ${text}`)
    });

    const unifiedArray = messageArrays.reduce((messages, messageArray) => [...messages, ...messageArray], []);
    return unifiedArray.map((message: string) => message.replace(/\s+/g, ' ').trim());
};

const setUserAttribute = async (userId: string, attribute: string, value: string) => {
    if (attribute === 'alias') {
        const user = await User.findOne({ _id: userId });

        if (user.is_anonymous) {
            return { error: 'aliases cannot be set for anonymous users.' };
        }


        if (value.length > 5) {
            return { error: `alias too long. max 5 characters.` };
        }

        try {
            await User.findOneAndUpdate({ _id: userId }, { alias: value });
            return { alias: value };
        } catch (error) {
            console.log(error); // 👁: observe
            return { error: 'alias already exists. please choose another.' };
        }
    }
};

const handleChannelCmd = async (userId: string, userInput: string, channelId?: string): Promise<any> => {
    try {
        if (userInput.toLowerCase().startsWith('/list ')) {
            const [cmd, attribute] = userInput.split(' ');

            if (!attribute) {
                throw new Error(`Invalid input: ${userInput}`)
            }

            const isAdmin: Promise<boolean> = await channelCtrl.isAdmin(userId);

            if (attribute === 'channels') {
                const channels = await channelCtrl.listChannels(isAdmin);

                const channelList = channels.map((channel: any) => `  ${channel.channel_id}`);
    
                return {
                    state: {
                        mode: 'default',
                        prompt: '$',
                    },
                    lines: [
                        isAdmin
                            ? "public channels:"
                            : "all channels:",
                        ...channelList
                    ]
                };
            }

            if (attribute === 'users') {
                if (!isAdmin) {
                    throw new Error(`Unauthorized: ${userInput}`)
                }

                const users = await User.find().select('name email created');

                const userList = users.map((user: any) => `  ${user.name}, ${user.email}, ` +
                    `${user.created.toString().slice(0, 15)}`);
    
                return {
                    state: {
                        mode: 'default',
                        prompt: '$',
                    },
                    lines: [
                        `users(${userList.length}):`,
                        ...userList
                    ]
                };
            }
        }

        if (userInput.toLowerCase() === '/exit') {
            if (!channelId) {
                return handleInput(userId, userInput, 'GENERIC');
            }

            return {
                state: {
                    mode: 'default',
                    prompt: '$',
                    channel_id: '',
                    ws: null
                },
                lines: [
                    "left channel."
                ]
            };
        }

        if (userInput.toLowerCase().startsWith('/nuke')) {
            const [cmd, targetChannel, targetUser] = userInput.split(' ');

            if (!targetChannel) {
                return {
                    lines: ['target not specified.']
                };
            }

            const isChannelAdmin: Promise<boolean> = await channelCtrl.isAdmin(userId, targetChannel);

            if (!isChannelAdmin) {
                // let drillbot handle the request
                return handleInput(userId, userInput, 'GENERIC');
            }

            if (targetUser) {
                await channelMsgCtrl.nukeUserMessages(userId, targetChannel, targetUser);
            }

            else {
                await channelMsgCtrl.nukeChannelMessages(userId, targetChannel);
            }

            return {
                lines: [
                    targetUser
                        ? `nuked ${targetUser} from #${targetChannel}.`
                        : `nuked all messages in #${targetChannel}.`
                ]
            };
        }

        if (userInput.toLowerCase().startsWith('/set ')) {
            const [cmd, attribute, value] = userInput.split(' ');

            const updatedValues = await setUserAttribute(userId, attribute, value);

            if (updatedValues.error) {
                return {
                    lines: [updatedValues.error]
                };
            };

            return {
                user: {
                    ...updatedValues
                },
                lines: [
                    `${attribute} successfully set to ${value}.`
                ]
            };
        }

        // these commands change a channels channel_op
        // disable chown after retry attempts threshold 
        // / flag user (dramtically sign them out too)

        // /chown channel p@ssw0rd - (main method) chown to current user
        // /chown enable channel p@ssw0rd - enable chown and set/update pwd
        // /chown disable channel p@ssw0rd - disable chown
        // /chown upwd channel oldp@ssw0rd newp@ssw0rd - change chown password
        if (userInput.toLowerCase().startsWith('/chown')) {
            const inputArray = userInput.split(' ');
            // change channel ownership
            if (inputArray.length === 3) {
                const [cmd, channelId, passphrase] = inputArray;

                const result = await channelCtrl.changeChannelOwnership(userId, channelId, passphrase);

                if (result.error) {
                    return {
                        lines: [result.error]
                    };
                }

                if (result.message === 'SUCCESS') {
                    return {
                        lines: [`you now own #${channelId}.`]
                    };
                }

                throw new Error(`invalid chown result: ${result}`);
            }

            // enable chown and set passphrase
            if (inputArray[1] == 'enable') {
                const [cmd, operator, channelId, passphrase] = inputArray;

                if (!passphrase) {
                    return await handleInput(userId, userInput, 'GENERIC');
                }

                const result = await channelCtrl.enableChown(userId, channelId, passphrase);

                if (result.error) {
                    return {
                        lines: [result.error]
                    };
                }

                if (result.message === 'SUCCESS') {
                    return {
                        lines: [`chown enabled.`]
                    };
                }

                throw new Error(`invalid chown result: ${result}`);
            }

            // update passphrase
            // /chown upwd channel oldp@ssw0rd newp@ssw0rd - change chown password
            if (inputArray[1] == 'upwd') {
                const [cmd, operator, channelId, oldPassphrase, newPassphrase] = inputArray;

                if (!oldPassphrase || !newPassphrase) {
                    return await handleInput(userId, userInput, 'GENERIC');
                }

                const result = await channelCtrl.updatePassphrase(userId, channelId, oldPassphrase, newPassphrase);

                if (result.error) {
                    return {
                        lines: [result.error]
                    }
                }

                if (result.message === 'SUCCESS') {
                    return {
                        lines: [`chown passphrase updated.`]
                    };
                }

                throw new Error(`invalid chown result: ${result}`);
            }

            // disable chown
            // /chown disable channel p@ssw0rd - disable chown
            if (inputArray[1] == 'disable') {
                const [cmd, operator, channelId, passphrase] = inputArray;

                if (!passphrase) {
                    return await handleInput(userId, userInput, 'GENERIC');
                }

                const result = await channelCtrl.disableChown(userId, channelId, passphrase);

                if (result.error) {
                    return {
                        lines: [result.error]
                    };
                }

                if (result.message === 'SUCCESS') {
                    return {
                        lines: [`chown disabled.`]
                    };
                }

                throw new Error(`invalid chown result: ${result}`);
            }

            // chown help menu
            if (inputArray[1] === 'help') {
                return {
                    lines: [
                        'chown (ch-ange own-ership) menu',
                        '* for channel admins/owners',
                        '  /CHOWN enable channel_name PWD  => enable chown for channel and set password.',
                        '  /CHOWN disable channel_name PWD => disable chown for channel.',
                        '  /CHOWN channel_name PWD         => change channel ownership to current user.',
                        '  /CHOWN upwd channel_name OLDPWD NEWPWD => change chown password.',
                    ]
                }
            }

            throw new Error(`invalid command: ${userInput}`);
        };

        // /dm frtnx - puts you in 2-person channel
        // /dm frtnx hey man wassup
        // if ((userInput.toLowerCase().startsWith('/dm '))) {

        // }

        // /mail - display inbox-, sent-, etc details
        // /mail inbox 20 - list the last 20 chats in your inbox
        // /mail sent 20 - list last 20
        // if ((userInput.toLowerCase().startsWith('/mail '))) {

        // }

        if (userInput.toLowerCase().startsWith('/join')) {
            const [cmd, channelId] = userInput.split(' ');

            if (!channelId) {
                return {
                    lines: ['channel not specified.']
                };
            }

            const channelExists: boolean = await Channel.exists({ channel_id: channelId });

            const banners: Array<string> = ['iching', 'default'];

            const selectedBanner: string = banners[random(0, banners.length)];

            let channelBanner: Array<string>;

            if (selectedBanner === 'iching') {
                const iching = [
                    [''],
                    ['           ############', '           ####    ####'],
                    ['           ############', '           ####    ####'],
                    ['           ############', '           ####    ####'],
                    ['']
                ];

                const trigram = iching.reduce((trigram, values) => {
                    const value = values[random(0, values.length)];
                    return [...trigram, value, value]
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
                        ...channelBanner,
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
                        ` you are now in #${channelId}.`,
                        ...channelBanner
                    ]
                }
            };
        }

        throw new Error(`Unrecognized command: ${userInput}`);
    } catch (error) {
        console.log(error);
        return handleInput(userId, userInput, 'GENERIC');
    }
};

const handleInput = async (userId: string, userInput: string, inputType: string): Promise<any> => {
    if (inputType === 'HELP_REQUEST') {
        const lines: Array<string> = [
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

        return {
            state: {
                mode: 'default'
            },
            lines
        };
    };

    if (inputType === 'CHANNEL_CMD') {
        const { lines, state, user } = await handleChannelCmd(userId, userInput);
        return { lines, state, user };
    }

    // GENERIC
    const result = await got(`${config.drillBotServer}?text=${userInput}&&sessionId=${userId}`);
    const lines = splitLines(JSON.parse(result.body));

    return {
        state: {
            mode: 'default'
        },
        lines
    };
};

const processTerminalInput = async (request: IRequest, response: IResponse): Promise<IResponse> => {
    try {
        const userId: string = request.query.user_id;

        const userInput: string = request.query.input;

        const inputType: string = evaluateInputType(userInput);

        const { lines, state, user } = await handleInput(userId, userInput, inputType);

        return response.json({ lines, state, user });
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
