export { };

const ChannelMessage = require('../models/channel.message.model');

const appendChannelMessage = async (userId: string, userInput: string, channelId: string) => {
    const channelMessage = new ChannelMessage({
        user_id: userId,
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

module.exports = {
    appendChannelMessage,
    fetchChannelMessages
};
