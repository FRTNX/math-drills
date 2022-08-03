export { };

const { config } = require('../../config/config');

const User = require('../models/user.model');
const UserAnswer = require('../models/user.answer.model');

const Question = require('../models/question.model');

const extend = require('lodash/extend');
const errorHandler = require('./../helpers/db.error.handler');

const formidable = require('formidable');
const fs = require('fs');

const random = require('../helpers/random');
const profileImage = fs.readFileSync('./src/assets/images/p3.jpg');

interface IRequest {
    query?: {
        user_id?: string,
        question_id?: string,
        question_type?: string,
        key?: string
    },
    body?: {
        user_id?: string
        question_id?: string,
        question_type: string,
        time_taken?: number
    },
    profile?: {
        hashed_password: string,
        salt: string,
        photo: {
            contentType: string,
            data: Buffer
        },
        updated: number,
        save: Function,
    }
}

interface IResponse {
    status: Function,
    json: Function,
    set: Function,
    send: Function,
    sendFile: Function
}

interface IRandomizedAnswer {
    isCorrect: boolean
}

// Durstenfeld shuffle; todo: change to Fisher-Yates; eventually move to helpers
const shuffle = (array: Array<IRandomizedAnswer>) : Array<IRandomizedAnswer> => {
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

const create = async (request: IRequest, response: IResponse) : Promise<IResponse> => {
    try {
        const user = new User(request.body);
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

const populateOps = async (request: IRequest, response: IResponse) : Promise<IResponse> => {
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
    response: IResponse,next: Function, id: string) : Promise<IResponse|void> => {
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

const read = (request: IRequest, response: IResponse) : IResponse => {
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
}

const userCount = async (request: IRequest, response: IResponse) : Promise<IResponse> => {
    try {
        if (request.query.key !== config.adminKey) {
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
    update,
    photo,
    defaultPhoto,
    userCount,
    populateOps
};
