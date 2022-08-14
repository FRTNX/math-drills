export { };

const Channel = require('../models/channel.model');
const errorHandler = require('./../helpers/db.error.handler');


const create = async (userId: string, channelId: string, visibility: string) => {
    const channel = new Channel({
        channel_op: userId,
        channel_id: channelId,
        visibility: visibility
    });

    await channel.save();

    return { message: 'SUCCESS' };
};

const fetchChannel = async (channelId: string) => {
    const channel = await Channel.find({ channel_id: channelId });
    console.log('found channel: ', channel);
    return channel;
};

const publishChannel = async (request, response) => {
    try {
        const channelId = request.query.channel_id;
        await Channel.findOneAndUpdate({ channel_id: channelId }, { visibility: 'public' });
        return response.json({ result: 'SUCCESS' });
    } catch (error) {
        console.log(error)
        return response.status(400).json({
            error: errorHandler.getErrorMessage(error)
        });
    }
};

const unPublishChannel = async (request, response) => {
    try {
        const channelId = request.query.channel_id;
        await Channel.findOneAndUpdate({ channel_id: channelId }, { visibility: 'private' });
        return response.json({ result: 'SUCCESS' });
    } catch (error) {
        console.log(error)
        return response.status(400).json({
            error: errorHandler.getErrorMessage(error)
        });
    }
};


const listChannels = async () => {
    const channels = await Channel.find({ visibility: 'public' });
    console.log('found public channels: ', channels);

    return channels;
};

const listAllChannels = async (request, response) => {
    try {
        const channels = await Channel.find();
        return response.json(channels);
    } catch (error) {
        console.log(error)
        return response.status(400).json({
            error: errorHandler.getErrorMessage(error)
        });
    }
};

const addChannelMember = async (userId: string, channelId: string) => {
    await Channel.findOneAndUpdate({ channel_id: channelId }, { $push: { members: userId } });
    console.log('added new member: ');

    return { result: 'SUCCESS' };
};

const listChannelMembers = async (userId: string, channelId: string) => {
    const members = await Channel.findOneAndUpdate({ channel_id: channelId })
        .select('members')
        .populate('members', '_id name')
        .exec();

    console.log('members: ', members);

    return members;
};


module.exports = {
    create,
    fetchChannel,
    listChannels,
    listAllChannels,
    listChannelMembers,
    addChannelMember,
    publishChannel,
    unPublishChannel
};
