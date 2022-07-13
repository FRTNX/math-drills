const User = require('../models/user.model');
const UserAnswer = require('../models/user.answer.model');

const Question = require('../models/question.model');

const extend = require('lodash/extend');
const errorHandler = require('./../helpers/dbErrorHandler');

const formidable = require('formidable');
const fs = require('fs');

const random = require('../helpers/random');
const profileImage = fs.readFileSync('./src/assets/images/p3.jpg');

// Durstenfeld shuffle, todo: change to Fisher-Yates; eventually move to helpers
const shuffle = (array) => {
    for (var i = array.length - 1; i > 0; i --) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    };

    return array;
};

const generateRandomizedData = async (userId) => {
    const questionTypes = await Question.find({}).distinct('question_type');
    console.log('Got distinct question types: ', questionTypes);

    await Promise.all(questionTypes.map((questionType) => {
        const ranges = [11, 15, 20];
        const numberOfQuestions = ranges[random(0, ranges.length - 1)];

        const randomizedAnswers = [];

        const incorrectAnswers = random(3, 4);
        const correctAnswers = numberOfQuestions - incorrectAnswers;

        for (let i = 0; i < correctAnswers; i++) {
            randomizedAnswers.push({ isCorrect: true });
        }

        for (let i = 0; i < incorrectAnswers; i++) {
            randomizedAnswers.push({ isCorrect: false });
        }

        let currentRating = 0;

        // console.log('shuffled: ', shuffle(randomizedAnswers))

        shuffle(randomizedAnswers).map(async(randomizedAnswer) => {
            const question = await Question.findOne({ question_type: questionType, difficulty: 0 });
            // console.log('Got question: ', question);

            const timeTaken = random(1000, question.time_limit + 1000);

            if (randomizedAnswer.isCorrect) {
                const questionAward = timeTaken <= question.time_limit
                    ? question.base_award
                    : question.base_award - question.time_penalty;
                currentRating += questionAward;
            } else {
                currentRating -= question.base_award;
            }

            console.log('current rating: ', currentRating)

            const answer = UserAnswer({
                user_id: userId,
                question_id: question._id,
                question_type: question.question_type,
                question_difficulty: question.question_difficulty,
                user_answer: 'randomized',
                is_correct: randomizedAnswer.isCorrect,
                time_taken: timeTaken,
                rating: currentRating
            });


            await answer.save();
        });
    }))
};

const create = async (request, response) => {
    console.log('Creating user', request.body)
    try {
        const user = new User(request.body);
        await user.save();

        await generateRandomizedData(user._id);

        return response.status(200).json({
            message: "Successfully signed up!"
        });
    } catch (error) {
        console.log(error)
        return response.status(400).json({
            error: errorHandler.getErrorMessage(error)
        });
    }
};

const sendRandomizedDataToUser = async (request, response) => {
    try {
        const userId = request.query.user_id;

        const userExists = await User.exists({ _id: userId });

        if (!userExists) {
            return response.status(404).json({ error: 'user not found' });
        }

        const alreadyRandomized = await UserAnswer.exists({ user_id: userId, user_answer: 'randomized' });

        if (alreadyRandomized) {
            throw new Error('This user has already recieved randomized data');
        }
        
        // await UserAnswer.deleteMany({ user_id: userId });

        await generateRandomizedData(userId);

        return response.status(200).json({
            message: 'SUCCESS'
        });
    } catch (error) {
        console.log(error)
        return response.status(400).json({
            error: errorHandler.getErrorMessage(error)
        });
    }
};

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
    userCount,
    sendRandomizedDataToUser
};
