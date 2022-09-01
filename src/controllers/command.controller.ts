// export { };

// const { config } = require('./../../config/config');
// const random = require('./../helpers/random');

// const User = require('../models/user.model');

// const Channel = require('../models/channel.model');
// const ChannelMessage = require('../models/channel.message.model');

// const channelCtrl = require('./channel.controller');
// const channelMsgCtrl = require('./channel.message.controller');

// const errorHandler = require('./../helpers/db.error.handler');

// import { IRequest, IResponse } from './controller.types';

// const got = require('got');

// // todo: move to helpers
// const splitLines = (text: string, limit: number = 60): Array<string> => {
//     let line: string = '';

//     const lines: Array<string> = [];

//     const wordsArray: Array<string> = text.split(' ');

//     wordsArray.map((word, index) => {
//         let newLine: string = `${line} ${word}`;
//         const isLastWord: boolean = index === wordsArray.length - 1;
//         if (newLine.length > limit || isLastWord) {
//             isLastWord ? lines.push(newLine) : lines.push(line);
//             line = word;
//         }

//         if (newLine.length <= limit) {
//             line = newLine;
//         }
//     });

//     return lines
// };

// const evaluateInputType = (userInput: string): string => {
//     if (userInput.startsWith('/')) {
//         return 'CHANNEL_CMD';
//     }

//     if (userInput === 'help') {
//         return 'HELP_REQUEST';
//     }

//     return 'GENERIC';
// };

// const formatAlias = (alias: string) => {
//     // let formattedAlias = alias;
//     // const spacesToAdd = 5 - alias.length;
//     // if (spacesToAdd > 0) {
//     //   console.log('adding spaces: ', spacesToAdd)
//     //   for (let i = 0; i < spacesToAdd; i ++) {
//     //     formattedAlias = formattedAlias + ' ';
//     //   }
//     // }
//     // return formattedAlias;
//     return alias;
// };

// const formatChannelMessages = (messages) => {
//     const messageArrays = messages.map((message) => {
//         const text = message.text.trim() === '/exit'
//             ? 'left channel.'
//             : message.text;

//         const userId = message.user_id.toString();

//         const header = message.user_alias
//             ? message.user_alias
//             : userId.slice(userId.length - 5);

//         return splitLines(`${formatAlias(header)} > ${text}`)
//     });

//     const unifiedArray = messageArrays.reduce((messages, messageArray) => [...messages, ...messageArray], []);
//     return unifiedArray.map((message: string) => message.replace(/\s+/g, ' ').trim());
// };

// const setUserAttribute = async (userId, attribute: string, value: string) => {
//     if (attribute === 'alias') {
//         const user = await User.findOne({ _id: userId });

//         if (!user.is_anonymous) {
//             if (value.length > 5) {
//                 return { error: `alias too long. max 5 characters.` };
//             }

//             try {
//                 await User.findOneAndUpdate({ _id: userId }, { alias: value });
//                 return { alias: value };
//             } catch (error) {
//                 console.log(error);
//                 return { error: 'alias already exists. please choose another.' };
//             }
//         }

//         else {
//             return { error: 'aliases cannot be set for anonymous users.' };
//         }
//     }
// };


// const handleInput = async (userId: string, userInput: string, inputType: string): Promise<any> => {
//     if (inputType === 'HELP_REQUEST') {
//         const lines: Array<string> = [
//             ' math drills help menu',
//             '  /SET alias your_alias => set a new alias, replace ',
//             '                           "your_alias" with your desired alias.',
//             '                           /set alias only works outside channels.',
//             '  /LIST channels        => list public chat channels.',
//             '  /JOIN channel_name    => join a specified channel. replace channel_name',
//             '                           with your desired channel. if the channel does not',
//             '                           exist, it will be created with you as the op.',
//             '                           new channels are private by default.',
//             '  /EXIT                 => exit the current channel.',
//             '  /HELP                 => (incoming) show a channel specific help menu',
//             '  help                  => show this help menu.',
//             '  clear                 => clear all terminal output.',
//             "any other input outside a channel that isn't a command will be processed",
//             "by drillbot."
//         ];

//         return {
//             lines,
//             state: {
//                 mode: 'default'
//             }
//         };
//     };

//     if (inputType === 'CHANNEL_CMD') {
//         const { lines, state, user } = await handleChannelCmd(userId, userInput);
//         return { lines, state, user };
//     }

//     const result = await got(`${config.drillBotServer}?text=${userInput}&&sessionId=${userId}`);
//     const lines = splitLines(JSON.parse(result.body));

//     return {
//         state: {
//             mode: 'default'
//         },
//         lines
//     };
// };

// const handleChannelCmd = async (userId: string, userInput: string, channelId?: string): Promise<any> => {
//     try {
//         if (userInput.toLowerCase() === '/list channels') {
//             const channels = await channelCtrl.listChannels();

//             const channelList = channels.map((channel: any) => `    ${channel.channel_id}`);

//             return {
//                 state: {
//                     mode: 'default',
//                     prompt: '$',
//                 },
//                 lines: [
//                     " public channels:",
//                     ...channelList
//                 ]
//             };
//         }

//         if (userInput.toLowerCase() === '/exit') {
//             if (!channelId) {
//                 return handleInput(userId, userInput, 'GENERIC');
//             }

//             return {
//                 state: {
//                     mode: 'default',
//                     prompt: '$',
//                     channel_id: '',
//                     ws: null
//                 },
//                 lines: [
//                     "left channel."
//                 ]
//             };
//         }

//         // for now only works for a specified super user
//         if (userInput.toLowerCase().startsWith('/nuke')) {
//             const isAdmin = await channelCtrl.isAdmin(userId);
//             console.log('is user admin: ', isAdmin)

//             if (!isAdmin) {
//                 // let drillbot handle the request
//                 return handleInput(userId, userInput, 'GENERIC');
//             }

//             const [cmd, targetChannel, targetUser] = userInput.split(' ');

//             if (!targetChannel) {
//                 return {
//                     lines: ['target not specified.']
//                 }
//             }

//             if (targetUser) {
//                 await channelMsgCtrl.nukeUserMessages(userId, targetChannel, targetUser);
//             }

//             else {
//                 await channelMsgCtrl.nukeChannelMessages(userId, targetChannel);
//             }

//             return {
//                 lines: [
//                     targetUser
//                         ? `nuked ${targetUser} from #${targetChannel}`
//                         : `nuked all messages in #${targetChannel}`
//                 ]
//             };
//         }

//         if (userInput.toLowerCase().startsWith('/set ')) {
//             const [cmd, attribute, value] = userInput.split(' ');

//             const updatedValues = await setUserAttribute(userId, attribute, value);

//             if (updatedValues.error) {
//                 return {
//                     lines: [updatedValues.error]
//                 }
//             };

//             return {
//                 user: {
//                     ...updatedValues
//                 },
//                 lines: [
//                     `${attribute} successfully set to ${value}.`
//                 ]
//             };
//         }

//         // if (userInput.toLowerCase().startsWith('/chown')) {
//         //     const [cmd, method, attribute] = userInput.split(' ');

//         //     // change channel ownership
//         //     if (cmd && (!method && !attribute)) {

//         //     }

//         //     if (cmd && method) {
//         //         // enable channel ownership transfer
//         //         if (method === 'enable') {
//         //             // prompt user for required details
//         //         }

//         //         if (method === 'set' && attribute) {
//         //             if (attribute === 'pwd') {
//         //                 // change channel owner password
//         //             }
//         //         }
//         //     }

//         //     return {
//         //         lines: [
//         //             ``
//         //         ]
//         //     };
//         // };

//         if (userInput.toLowerCase().startsWith('/join ')) {
//             const [cmd, channelId] = userInput.split(' ');

//             const channelExists: boolean = await Channel.exists({ channel_id: channelId });

//             const banners: Array<string> = ['iching', 'default'];

//             const selectedBanner: string = banners[random(0, banners.length)];

//             let channelBanner: Array<string>;

//             if (selectedBanner === 'iching') {
//                 const iching = [
//                     [''],
//                     ['           ############', '           ####    ####'],
//                     ['           ############', '           ####    ####'],
//                     ['           ############', '           ####    ####'],
//                     ['']
//                 ];

//                 const trigram = iching.reduce((trigram, values) => {
//                     const value = values[random(0, values.length)];
//                     return [...trigram, value, value]
//                 }, []);

//                 // for the logs :)
//                 console.log(trigram);

//                 channelBanner = trigram;
//             }

//             if (selectedBanner === 'default') {
//                 channelBanner = [
//                     '',
//                     '       ',
//                     '        ^              ^       ',
//                     '     <       DRILLS       > ',
//                     '         .            .',
//                     '            ~  --  ~',
//                     ''
//                 ];
//             }

//             if (channelExists) {
//                 const msgCount: number = await ChannelMessage.count({ channel_id: channelId });

//                 const channelMessages = await channelMsgCtrl.fetchChannelMessages(channelId, 0);

//                 const formattedMessages = formatChannelMessages(channelMessages);

//                 // todo: check and update channel membership if necessary

//                 return {
//                     user: null,
//                     state: {
//                         mode: 'channel',
//                         prompt: `(${channelId})$`,
//                         channel_id: channelId,
//                         channel_msg_count: msgCount
//                     },
//                     lines: [
//                         ` you are now in #${channelId}.`,
//                         ...channelBanner,
//                         ...formattedMessages
//                     ]
//                 }
//             }

//             if (!channelExists) {
//                 await channelCtrl.create(userId, channelId, 'private')

//                 return {
//                     state: {
//                         mode: 'channel',
//                         prompt: `(${channelId})$`,
//                         channel_id: channelId,
//                         channel_msg_count: 0
//                     },
//                     lines: [
//                         ` you are now in #${channelId}.`,
//                         ...channelBanner
//                     ]
//                 }
//             }
//         }
//     } catch (error) {
//         console.log(error);
//         return handleInput(userId, userInput, 'GENERIC');
//     }
// };