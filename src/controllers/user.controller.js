const User = require('../models/user.model');
const extend = require('lodash/extend');
const errorHandler = require('./../helpers/dbErrorHandler');
const formidable = require('formidable');
const fs = require('fs');
const profileImage = fs.readFileSync('./src/assets/images/p3.jpg');

const create = async (request, response) => {
    console.log('Creating user', request.body)
    try {
        const user = new User(request.body);
        await user.save();
        return response.status(200).json({
            message: "Successfully signed up!"
        });
    } catch (error) {
        console.log(error)
        return response.status(400).json({
            error: errorHandler.getErrorMessage(error)
        });
    }
}

const userByID = async (request, response, next, id) => {
    try {
        let user = await User.findById(id).populate('following', '_id name')
            .populate('followers', '_id name')
            .exec()
        
        if (!user) {
            return response.status('400').json({
                error: "User not found"
            });
        };
        
        request.profile = user;
        next();
    } catch (error) {
        return response.status('400').json({
            error: "Could not retrieve user"
        });
    }
};

const read = (request, response) => {
    request.profile.hashed_password = undefined;
    request.profile.salt = undefined;
    return response.json(request.profile);
}

const list = async (request, response) => {
    try {
        const query = {};
        if (request.query.username) {
            query.name = { '$regex': request.query.username, '$options': 'i' }
        }

        let users = await User.find(query).select('name email updated created');
        response.json(users);
    } catch (error) {
        return response.status(400).json({
            error: errorHandler.getErrorMessage(error)
        });
    }
};

const update = (request, response) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(request, async (error, fields, files) => {
        if (error) {
            return response.status(400).json({
                error: "Photo could not be uploaded"
            })
        }

        let user = request.profile;
        user = extend(user, fields);
        user.updated = Date.now();

        if(files.photo) {
            user.photo.data = fs.readFileSync(files.photo.path);
            user.photo.contentType = files.photo.type;
        }
        try {
            await user.save();
            user.hashed_password = undefined;
            user.salt = undefined;
            response.json(user);
        } catch (error) {
            return response.status(400).json({
                error: errorHandler.getErrorMessage(error)
            })
        }
    });
};

const remove = async (request, response) => {
    try {
        let user = request.profile;
        
        let deletedUser = await user.remove();

        deletedUser.hashed_password = undefined;
        deletedUser.salt = undefined;

        response.json(deletedUser);
    } catch (error) {
        return response.status(400).json({
            error: errorHandler.getErrorMessage(error)
        });
    }
};

const photo = (request, response, next) => {
    if (request.profile.photo.data) {
        response.set("Content-Type", request.profile.photo.contentType);
        return response.send(request.profile.photo.data);
    }
    next();
};

const defaultPhoto = (request, response) => {
    return response.sendFile(process.cwd() + profileImage);
}

const addFollowing = async (request, response, next) => {
    try {
        await User.findByIdAndUpdate(request.body.userId, { $push: { following: request.body.followId }});
        next();
    } catch (error) {
        return response.status(400).json({
            error: errorHandler.getErrorMessage(error)
        });
    }
};

const addFollower = async (request, response) => {
    try {
        let result = await User.findByIdAndUpdate(request.body.followId, { $push: { followers: request.body.userId} }, { new: true })
            .populate('following', '_id name')
            .populate('followers', '_id name')
            .exec();
        result.hashed_password = undefined;
        result.salt = undefined;
        response.json(result);
    } catch(error) {
        return response.status(400).json({
            error: errorHandler.getErrorMessage(error)
        });
    }  
};

const removeFollowing = async (request, response, next) => {
    try {
        await User.findByIdAndUpdate(request.body.userId, {$pull: {following: request.body.unfollowId}});
        next();
    } catch (error) {
        return response.status(400).json({
            error: errorHandler.getErrorMessage(error)
        });
    }
};

const removeFollower = async (request, response) => {
    try {
        let result = await User.findByIdAndUpdate(request.body.unfollowId,
            { $pull: { followers: request.body.userId }},
            { new: true })
                .populate('following', '_id name')
                .populate('followers', '_id name')
                .exec();
        result.hashed_password = undefined;
        result.salt = undefined;
        response.json(result);
    } catch (error) {
        return response.status(400).json({
            error: errorHandler.getErrorMessage(error)
        });
    }
};

const findPeople = async (request, response) => {
    let following = request.profile.following;
    following.push(request.profile._id);
    try {
        let users = await User.find({ _id: { $nin : following } }).select('name');
        response.json(users);
    } catch (error) {
        return response.status(400).json({
            error: errorHandler.getErrorMessage(error)
        });
    }
};

const userCount = async (request, response) => {
    try {
        if (request.query.key !== 'FRTNX_VERITAS') {
            throw new Error('Oh no you dont')
        }

        let users = await User.find({}).select('name email');
        response.json({ count: users.length, users });
    } catch (error) {
        return response.status(400).json({
            error: errorHandler.getErrorMessage(error)
        });
    }
}

module.exports = {
    create,
    userByID,
    read,
    list,
    remove,
    update,
    photo,
    defaultPhoto,
    addFollowing,
    addFollower,
    removeFollowing,
    removeFollower,
    findPeople,
    userCount
};
