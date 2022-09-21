export { };

const { config } = require('../../config/config');

const User = require('../models/user.model');
const UserAnswer = require('../models/user.answer.model');

const Question = require('../models/question.model');

const random = require('../helpers/random');
const errorHandler = require('./../helpers/db.error.handler');

const formidable = require('formidable');
const jwt = require('jsonwebtoken');

const fs = require('fs');
const extend = require('lodash/extend');

const profileImage = fs.readFileSync('./src/assets/images/p3.jpg');

import { IRequest, IResponse } from './controller.types';

interface IRandomizedAnswer {
    isCorrect: boolean
}

// Durstenfeld shuffle; todo: change to Fisher-Yates; eventually move to helpers
const shuffle = (array: Array<IRandomizedAnswer>): Array<IRandomizedAnswer> => {
    for (var i = array.length - 1; i > 0; i--) {
        var j: number = Math.floor(Math.random() * (i + 1));
        var temp: IRandomizedAnswer = array[i];
        array[i] = array[j];
        array[j] = temp;
    };

    return array;
};

const populateRandomizedData = async (userId: string, operation?: string) => {
    let questionTypes: Array<string>;

    if (operation) {
        questionTypes = [operation];
    } else {
        questionTypes = await Question.find({}).distinct('question_type');
    }


    const result = await Promise.all(questionTypes.map(async (questionType) => {
        const alreadyRandomized = await UserAnswer.exists({
            user_id: userId,
            question_type: questionType,
            user_answer: 'randomized'
        });

        if (alreadyRandomized) {
            console.log(`Skipped ${questionType} for user ${userId}, ` +
                `randomized data already populated for this op`);
            return;
        }

        const numberOfQuestions: number = random(11, 20);

        const randomizedAnswers: Array<IRandomizedAnswer> = [];

        const incorrectAnswers: number = random(3, 5);
        const correctAnswers: number = numberOfQuestions - incorrectAnswers;

        for (let i = 0; i < correctAnswers; i++) {
            randomizedAnswers.push({ isCorrect: true });
        }

        for (let i = 0; i < incorrectAnswers; i++) {
            randomizedAnswers.push({ isCorrect: false });
        }

        let currentRating: number = 0;

        shuffle(randomizedAnswers).map(async (randomizedAnswer) => {
            const question = await Question.findOne({ question_type: questionType, difficulty: 0 });

            const timeTaken: number = random(1000, question.time_limit + 1000);

            if (randomizedAnswer.isCorrect) {
                const questionAward: number = timeTaken <= question.time_limit
                    ? question.base_award
                    : question.base_award - question.time_penalty;
                currentRating += questionAward;
            } else {
                currentRating -= question.base_award;
            }

            const answer = UserAnswer({
                user_id: userId,
                question_id: question._id,
                question_type: question.question_type,
                question_difficulty: question.question_difficulty,
                user_answer: 'randomized',
                is_correct: true, // randomized data should always be true, even if it trends down
                time_taken: timeTaken,
                rating: currentRating
            });


            await answer.save();
        });

        return { message: `Populated randomized data for op: ${questionType}` }
    }));

    return { [userId]: result.filter((r) => !r === false) };
};

/**
 * Regular user registration
 * @param request 
 * @param response 
 * @returns 
 */
const create = async (request: IRequest, response: IResponse): Promise<IResponse> => {
    try {
        const user = new User(request.body);

        if (!request.body.alias) {
            const userId: string = user._id.toString();
            const defaultAlias: string = userId.slice(userId.length - 5);
            user.alias = defaultAlias;
        }

        user.is_anonymous = false;

        await user.save();

        await populateRandomizedData(user._id);

        return response.status(200).json({ message: 'SUCCESS' });
    } catch (error) {
        console.log(error)
        return response.status(400).json({
            error: errorHandler.getErrorMessage(error)
        });
    }
};

// meant to run once to retrofit default aliases to pre-existing users
const retrofitAliases = async (request: IRequest, response: IResponse): Promise<IResponse> => {
    try {
        const users = await User.find({}).select('_id allias');

        const aliaslessUsers = users.filter((user) => !user.alias);

        await Promise.all(aliaslessUsers.map(async (user: any) => {
            const userId = user._id.toString();
            const defaultAlias = userId.slice(userId.length - 5);
            await User.findOneAndUpdate({ _id: user._id }, { alias: defaultAlias });
        }));

        return response.status(200).json({ message: 'SUCCESS' });
    } catch (error) {
        console.log(error)
        return response.status(400).json({
            error: errorHandler.getErrorMessage(error)
        });
    }
}

const anonymousLogin = async (request: IRequest, response: IResponse): Promise<IResponse> => {
    try {
        const anonymousUsers: number = await User.count({
            name: 'Anonymous User',
            password: 'anonymous1'
        });

        const user = new User({
            name: 'Anonymous User',
            password: 'anonymous1',
            email: `user${anonymousUsers + 1}@anonymous.com`,
            is_anonymous: true
        });

        const userId: string = user._id.toString();
        const defaultAlias: string = userId.slice(userId.length - 5);
        user.alias = defaultAlias;

        console.log('created anonymous user: ', user)

        await user.save();

        await populateRandomizedData(user._id);

        const token: string = jwt.sign({ _id: user._id }, config.jwtSecret);
        response.cookie("t", token, { expire: Number(new Date()) + 9999 });

        return response.json({ token, user: { _id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        console.log(error)
        return response.status(400).json({
            error: errorHandler.getErrorMessage(error)
        });
    }
};

const populateOps = async (request: IRequest, response: IResponse): Promise<IResponse> => {
    try {
        const userIds: Array<string> = [];

        if (request.query.user_id) {
            const userId: string = request.query.user_id;
            const userExists: boolean = await User.exists({ _id: userId });

            if (!userExists) {
                return response.status(404).json({ error: 'user not found' });
            }

            userIds.push(request.query.user_id);
        }

        if (!request.query.user_id) {
            const users = await User.find({})
                .select('_id')
                .exec();

            users.map((user) => {
                userIds.push(user._id);
            });
        };

        console.log(`populating ops for ${userIds.length} users`);

        const result = await Promise.all(userIds.map((userId) => populateRandomizedData(userId)));
        console.log('result of randomized population: ', result)

        return response.status(200).json(result);
    } catch (error) {
        console.log(error)
        return response.status(400).json({
            error: errorHandler.getErrorMessage(error)
        });
    }
};

const userByID = async (request: IRequest,
    response: IResponse, next: Function, id: string): Promise<IResponse | void> => {
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

const read = (request: IRequest, response: IResponse): IResponse => {
    request.profile.hashed_password = undefined;
    request.profile.salt = undefined;
    return response.json(request.profile);
};

const update = async (request: IRequest, response: IResponse) => {
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

        if (files.photo) {
            user.photo.data = fs.readFileSync(files.photo.path);
            user.photo.contentType = files.photo.type;
        }
        try {
            await user.save();
            user.hashed_password = undefined;
            user.salt = undefined;
            return response.json(user);
        } catch (error) {
            return response.status(400).json({
                error: errorHandler.getErrorMessage(error)
            })
        }
    });
};

const photo = (request: IRequest, response: IResponse, next: Function) => {
    if (request.profile.photo.data) {
        response.set("Content-Type", request.profile.photo.contentType);
        return response.send(request.profile.photo.data);
    }
    next();
};

const defaultPhoto = (request: IRequest, response: IResponse) => {
    return response.sendFile(process.cwd() + profileImage);
};

const userCount = async (request: IRequest, response: IResponse): Promise<IResponse> => {
    try {
        if (request.query.key !== config.adminKey) {
            throw new Error('Oh no you dont')
        }

        let users = await User.find({}).select('name email created');
        response.json({ count: users.length, users });
    } catch (error) {
        return response.status(400).json({
            error: errorHandler.getErrorMessage(error)
        });
    }
};

const fetchUserAlias = async (request: IRequest, response: IResponse): Promise<IResponse> => {
    try {
        const userId = request.query.user_id;
        const user = await User.findOne({ _id: userId }).select('alias');
        console.log('found user alias: ', user)
        response.json({ alias: user.alias });
    } catch (error) {
        return response.status(400).json({
            error: errorHandler.getErrorMessage(error)
        });
    }
};

module.exports = {
    create,
    userByID,
    read,
    update,
    photo,
    defaultPhoto,
    userCount,
    populateOps,
    anonymousLogin,
    retrofitAliases,
    fetchUserAlias
};
