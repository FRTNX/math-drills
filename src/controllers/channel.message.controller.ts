export { };

const User = require('../models/user.model');
const ChannelMessage = require('../models/channel.message.model');

const appendChannelMessage = async (userId: string, userInput: string, channelId: string) => {
    if (userInput.startsWith('/')) {
        return { message: 'CMD_OMIT' };
    }
    
    const user = await User.findOne({ _id: userId }).select('alias');

    const channelMessage = new ChannelMessage({
        user_id: userId,
        user_alias: user.alias,
        channel_id: channelId,
        text: userInput
    });

    await channelMessage.save();

    return { message: 'SUCCESS' };
};

const fetchChannelMessages = async (channelId: string, msgCount: number = 0) => {
    const currentCount: number = await ChannelMessage.count({ channel_id: channelId });

    let numberOfMessages = msgCount > 0
        ? currentCount - msgCount
        : 50;

    console.log(`Fetching ${numberOfMessages} msg(s)`);

    let channelMessages: Array<any> = [];

    if (numberOfMessages > 0) {
        channelMessages = await ChannelMessage.find({ channel_id: channelId })
            .sort('-created')
            .limit(numberOfMessages)
            .exec();
    }

    return channelMessages.reverse();
};

/**
 * Assumes userId has already been validated as admin. secondary validation
 * within the function itself may be added in future if necessary.
 * This function deletes all target user activity in a channel.
 * @param userId admin super user id.
 * @param channelId the channel in which to do the nuking.
 * @param target (alias) the user to nuke.
 */
const nukeUserMessages = async (userId: string, channelId: string, target: string) => {
    await ChannelMessage.deleteMany({ channel_id: channelId, user_alias: target });

    return { result: 'SUCCESS' };
};

/**
 * Nuke all messages in a channel.
 * @param userId admin super user id.
 * @param channelId godspeed.
 * @returns 
 */
const nukeChannelMessages = async (userId: string, channelId: string) => {
    await ChannelMessage.deleteMany({ channel_id: channelId });

    return { result: 'SUCCESS' };
};

module.exports = {
    appendChannelMessage,
    fetchChannelMessages,
    nukeChannelMessages,
    nukeUserMessages
};
