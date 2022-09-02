export { };

const Channel = require('../models/channel.model');
const User = require('../models/user.model');

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

const listChannels = async (isAdmin: boolean = false) => {
    if (isAdmin) {
        return await Channel.find();
    }

    const channels = await Channel.find({ visibility: 'public' });
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

const isAdmin = async (userId: string, channelId?: string) => {
    const user = await User.findOne({ _id: userId }).select('alias');

    if (channelId) {
        const channel = await Channel.findOne({ channel_id: channelId });
        const channelOpUserId = channel.channel_op.toString();
        // todo: return ... || user.is_admin;
        return channelOpUserId === userId || user.alias === 'frtnx';
    }

    return user.alias === 'frtnx';
};

const changeChannelOwnership = async (userId: string, channelId: string, passphrase: string) => {
    const channel = await Channel.findOne({ channel_id: channelId });

    if (!channel.chown_enabled) {
        return { error: 'chown not enabled for this channel.' };
    };

    if (channel.passphrase === passphrase) {
        await Channel.findOneAndUpdate({ channel_id: channelId }, { channel_op: userId });
        return { message: 'SUCCESS' };
    }

    return { error: 'invalid credentials.' };
};

const updatePassphrase = async (userId: string, channelId: string, oldPassphrase: string, newPassphrase: string) => {
    const channel = await Channel.findOne({ channel_id: channelId });

    const channelOpUserId = channel.channel_op.toString();

    if (channelOpUserId !== userId || channel.passphrase !== oldPassphrase) {
        return { error: 'unauthorized.' };
    }

    await Channel.findOneAndUpdate({ channel_id: channelId }, { passphrase: newPassphrase });

    return { message: 'SUCCESS' };
}

const enableChown = async (userId: string, channelId: string, passphrase: string) => {
    const channel = await Channel.findOne({ channel_id: channelId });

    const channelOpUserId = channel.channel_op.toString();

    if (channelOpUserId === userId) {
        await Channel.findOneAndUpdate({ channel_id: channelId }, { chown_enabled: true, passphrase });
        return { message: 'SUCCESS' };
    }

    return { error: 'unauthorized.' };
};

const disableChown = async (userId: string, channelId: string, passphrase: string) => {
    const channel = await Channel.findOne({ channel_id: channelId });

    const channelOpUserId = channel.channel_op.toString();

    if (channelOpUserId === userId && channel.passphrase === passphrase) {
        await Channel.findOneAndUpdate({ channel_id: channelId }, { chown_enabled: false, passphrase: '' });
        return { message: 'SUCCESS' };
    }

    return { error: 'invalid credentials.' };
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
    unPublishChannel,
    isAdmin,
    changeChannelOwnership,
    enableChown,
    disableChown,
    updatePassphrase
};
