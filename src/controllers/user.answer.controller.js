const UserAnswer = require('../models/user.answer.model');
const Question = require('../models/question.model')
const errorHandler = require('./../helpers/dbErrorHandler');
const evaluations = require('./../helpers/evaluations'); // use this eventually


const saveUserAnswer = async (request, response) => {
    try {
        console.log('Got user answer: ', request.body)
        const question = await Question.findOne({ _id: request.body.question_id });

        const answer = evaluations.evaluateAnswer(question, request.body);
        // await UserAnswer.deleteMany({});

        const params = {
            user_id: request.body.user_id,
            question_type: request.body.question_type
        };

        const lastRelatedAnswer = await UserAnswer.find(params)
            .select('rating')
            .sort('-created')
            .limit(1)
            .exec();

        const timeTaken = request.body.time_taken;

        let currentRating = 0;
        lastRelatedAnswer.length > 0
            ? currentRating = lastRelatedAnswer[0].rating
            : '';

        if (!answer.isCorrect) {
            currentRating -= question.base_award;
        }

        else {
            let baseAward = question.base_award;

            timeTaken <= question.time_limit
                ? baseAward += question.time_award // todo: tighten time award threshold
                : baseAward -= question.time_penalty;


            console.log('Rating awarded: ', baseAward)
            currentRating += baseAward;
        }

        const userAnswer = new UserAnswer({
            ...request.body,
            is_correct: answer.isCorrect,
            rating: currentRating
        });

        console.log('Created user answer', userAnswer)

        await userAnswer.save();

        const result = {
            currentRating,
            isCorrect: answer.isCorrect,
            correctAnswer: answer.correctAnswer
        };

        return response.status(200).json(result);
    } catch (error) {
        console.log(error);
        return response.status(400).json({
            error: errorHandler.getErrorMessage(error)
        });
    }
};

// todo: reuse this where needed
const fetchUserAnswers = async (request, response) => {
    try {
        let query = { user_id: request.query.user_id };

        request.query.question_type
            ? query.question_type = request.query.question_type
            : '';

        const userAnswers = await UserAnswer.find(query);

        return response.status(200).json(userAnswers);
    } catch (error) {
        console.log(error);
        return response.status(400).json({
            error: errorHandler.getErrorMessage(error)
        });
    }
};

const fetchRatingProfile = (userRatings) => {
    if (userRatings.length === 0) {
        return { name: 'zygote', color: 'default' }
    }

    if (userRatings.length > 0 && userRatings.length < 10) {
        return { name: 'embryo', color: 'embryo', graphOptions: ['bar2'] };
    }

    if (userRatings.length >= 10 && userRatings[0] < 100) {
        return { name: 'grasshopper', color: 'primary', graphOptions: ['bar3'] };
    }

    if (userRatings.length > 0 && userRatings[0] >= 100) {
        return { name: 'mantis', color: 'primary', graphOptions: ['bar3'] };
    }

    // todo: add more, adjust conditions, move to separate file (rating.handler.js)
};

const fetchRatingHistory = async (request, response) => {
    try {
        let query = {
            user_id: request.query.user_id,
            question_type: request.query.question_type
        };

        const limit = request.query.limit
            ? request.query.limit
            : 10

        const userAnswers = await UserAnswer.find(query)
            .select('rating created')
            .sort('-created')
            .limit(limit)
            .exec();

        console.log('Got result: ', userAnswers.map((r) => r.rating));

        const userRating = userAnswers.map((r) => r.rating);
        const ratingProfile = fetchRatingProfile(userRating);

        console.log('Got rating profile: ', ratingProfile)

        let result;

        if (ratingProfile.name === 'zygote') {
            result = {
                ratings: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                ratingDetails: ratingProfile
            };
        }

        else {
            result = {
                ratings: userRating.reverse(),
                ratingDetails: ratingProfile
            }
        }

        console.log('Returning result: ', result)

        return response.status(200).json(result);
    } catch (error) {
        console.log(error);
        return response.status(400).json({
            error: errorHandler.getErrorMessage(error)
        });
    }
};

const fetchUserStats = async (request, response) => {
    try {
        console.log('Got request: ', request.query)
        const answeredQuestionTypes = await UserAnswer.find({ user_id: request.query.user_id })
            .distinct('question_type');

        console.log('found answered question types: ', answeredQuestionTypes);

        const result = await Promise.all(answeredQuestionTypes.map( async (questionType) => {
            const query = {
                user_id: request.query.user_id,
                question_type: questionType
            };

            const questionRatings = await UserAnswer.find(query)
                .select('rating created')
                .sort('-created')
                .limit(11)
                .exec();

            console.log(`Found ${questionType} questions: `, questionRatings);

            const ratingValues = questionRatings.map((r) => r.rating).reverse();
            const ratingProfile = fetchRatingProfile(ratingValues);

            console.log('Got rating profile: ', ratingProfile)

            return {
                operation: questionType,
                currentRating: ratingValues[ratingValues.length - 1],
                values: ratingValues,
                labels: ratingValues.map((value, index) => index + 1),
                pointRadius: 3, // eventually read from rating profile
                fill: true, // this too
                badgeColor: ratingProfile.color,
                graphOptions: ratingProfile.graphOptions
            }
        }));

        console.log('Got res: ', result)

        return response.status(200).json(result);
    } catch (error) {
        console.log(error);
        return response.status(400).json({
            error: errorHandler.getErrorMessage(error)
        });
    }
}

module.exports = {
    saveUserAnswer,
    fetchUserAnswers,
    fetchRatingHistory,
    fetchUserStats
};