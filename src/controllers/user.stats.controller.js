const User = require('../models/user.model');
const UserAnswer = require('../models/user.answer.model');
const AbortedQuestion = require('../models/aborted.question.model');
const errorHandler = require('./../helpers/dbErrorHandler');

const fetchRatingProfile = (userRatings, hasUserAnswers) => {
    // if all user answers are randomized answers
    if (!hasUserAnswers) {
        return { name: 'zygote', color: 'default', graphOptions: ['bar2'] }
    }

    if (userRatings[0] < 100) {
        return { name: 'embryo', color: 'embryo', graphOptions: ['bar3'] };
    }

    if (userRatings[0] >= 100 && userRatings[0] < 200) {
        return { name: 'grasshopper', color: 'primary', graphOptions: ['bar3'] };
    }

    if (userRatings[0] >= 200) {
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

        const hasUserAnswers = await UserAnswer.exists({ ...query, user_answer: {'$ne': 'randomized' }});
        console.log('has user submitted answers: ', hasUserAnswers)

        const userRating = userAnswers.map((r) => r.rating);
        const ratingProfile = fetchRatingProfile(userRating, hasUserAnswers);

        console.log('Got rating profile: ', ratingProfile)

        const result = {
            ratings: userRating.reverse(),
            ratingDetails: ratingProfile
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
        const userId = request.query.user_id;
        const user = await User.findOne({ _id: userId }).select('name');

        const totalAnsweredQuestions = await UserAnswer.count({ user_id: userId });

        const questionTypes = await UserAnswer.find({ user_id: userId })
            .distinct('question_type');

        const userAnswerDetails = await Promise.all(questionTypes.map(async (questionType) => {
            const answerRatings = await UserAnswer.find({ user_id: userId, question_type: questionType }).select('rating').sort('-created');
            const ratingValues = answerRatings.map((answerRating) => answerRating.rating);

            const isMastered = ratingValues[ratingValues.length - 1] > 200; // eventually read from op settings table

            const growth = ratingValues.length > 1
                ? calculateGrowth(...ratingValues.reverse().slice(ratingValues.length - 2))
                : 0;

            const highestRating = Math.max(...ratingValues);
            const lowestRating = Math.min(...ratingValues);

            return { questionType, ratingValues, growth, highestRating, lowestRating, isMastered };
        }));

        let bestOp = {};

        userAnswerDetails.map((answerDetails) => {
            const { questionType, highestRating } = answerDetails;
            if (!bestOp.questionType) {
                bestOp = { questionType, highestRating };
            }

            if (bestOp && bestOp.highestRating < highestRating) {
                bestOp = { questionType, highestRating };
            }
        });

        const growthValues = userAnswerDetails.map((answerDetails) => answerDetails.growth);

        let averageGrowth = 'N/A';
        if (growthValues.length == 1) {
            averageGrowth = `${growthValues[0]}%`;
        }

        if (growthValues.length > 1) {
            averageGrowth = `${Number(growthValues.reduce((partSum, value) => partSum + value, 0) / growthValues.length).toFixed(1)}%`;
        }

        const masteredOps = userAnswerDetails.reduce((partCount, details) => {
            return details.isMastered
                ? partCount + 1
                : partCount
        }, 0);

        const result = {
            name: user.name,
            totalAnsweredQuestions,
            bestOp: bestOp.questionType || 'N/A',
            avgGrowth: averageGrowth,
            masteredOps
        };

        return response.status(200).json(result);
    } catch (error) {
        console.log(error);
        return response.status(400).json({
            error: errorHandler.getErrorMessage(error)
        });
    }
};

const fetchOpGraphData = async (userId, questionType) => {
    const query = {
        user_id: userId,
        question_type: questionType
    };

    const questionRatings = await UserAnswer.find(query)
        .select('rating created')
        .sort('-created')
        .limit(11)
        .exec();

    // console.log(`Found ${questionType} questions: `, questionRatings);

    const hasUserAnswers = await UserAnswer.exists({ ...query, user_answer: {'$ne': 'randomized' }});
    console.log('has user submitted answers: ', hasUserAnswers)

    const ratingValues = questionRatings.map((r) => r.rating).reverse();
    const ratingProfile = fetchRatingProfile(ratingValues, hasUserAnswers);

    // console.log('Got rating profile: ', ratingProfile)

    return {
        operation: questionType,
        currentRating: ratingValues[ratingValues.length - 1],
        values: ratingValues,
        labels: ratingValues.map((value, index) => index + 1),
        pointRadius: 3, // eventually read from rating profile
        fill: true, // this too
        badgeColor: ratingProfile.color == 'default' ? 'embryo' : ratingProfile.color,
        graphOptions: ratingProfile.graphOptions
    }
};

const calculateGrowth = (valueA, valueB) => Math.round(((valueB - valueA) / valueA) * 100);

const formatTime = (millis) => {
    console.log('Got millis: ', millis)
    // ms
    if (millis < 1000) {
        return `${millis}ms`;
    }

    // s
    if (millis > 1000 && millis < 1000 * 60) {
        let sec = Math.round(millis /1000)
        let ms =  `${millis % 1000}`.slice(0, 2);

        if (Number(ms) > 60) {
            sec += 1;
            ms -= 60
        }

        return `${sec}.${ms}s`
    }

    // m
    if (millis > 1000 * 60 && millis < 1000 * 60 * 60) {
        let min = Math.round(millis / (1000 * 60))
        let sec = `${millis % (1000 * 60)}`.slice(0, 2);

        if (Number(sec) > 60) {
            min += 1;
            sec -= 60
        }

        return `${min}m ${sec}s`
    }

    // h

    // d

    // y
};

const longestPositiveTrend = async (numArray) => {
    const result = { streak: 0, count: 0, prevNum: 0 };
    numArray.map((value) => {
        if (value > result.prevNum) {
            result.prevNum = value;
            result.count += 1;
            if (result.count > result.streak) {
                result.streak = result.count;
            }
        }

        if (value < result.prevNum) {
            result.count = 0;
            result.prevNum = value;
        }
    });

    return result.streak;
};

const longestNegativeTrend = async (numArray) => {
    const result = { streak: 0, count: 0, prevNum: 0 };
    numArray.map((value) => {
        if (value < result.prevNum) {
            result.prevNum = value;
            result.count += 1;
            if (result.count > result.streak) {
                result.streak = result.count;
            }
        }

        if (value > result.prevNum) {
            result.count = 0;
            result.prevNum = value;
        }
    });

    return result.streak;
};

const fetchSpeedStats = async (request, response) => {
    try {
        const query = {
            user_id: request.query.user_id,
            question_type: request.query.op
        };
    
        const timePerQuestion = await UserAnswer.find(query)
            .select('time_taken')
            .sort('-created')
            .exec();
    
        const speedValues = timePerQuestion.map((question) => question.time_taken).reverse();

        const averageSpeed = speedValues.reduce((partSum, value) => partSum + Number(value), 0) / speedValues.length;
        console.log('average speed: ', averageSpeed)
    
        const result = {
            operation: request.query.op,
            currentRating: formatTime(averageSpeed),
            values: speedValues.map((value) => Number(value / 1000).toFixed(2)),
            labels: speedValues.map((value, index) => index + 1),
            pointRadius: 0,
            fill: true,
            badgeColor: 'primary',
            graphOptions: ['line2']
        };

        console.log(result)

        return response.status(200).json(result);
    } catch (error) {
        console.log(error);
        return response.status(400).json({
            error: errorHandler.getErrorMessage(error)
        });
    }
};

const fetchOpStats = async (userId, questionType) => {
    const params = { user_id: userId, question_type: questionType };

    const [totalCorrectAnswers, totalIncorrectAnswers, answerDetails, abortedQuestions, graphData] = await Promise.all([
        UserAnswer.count({ ...params, is_correct: true }),
        UserAnswer.count({ ...params, is_correct: false }),
        UserAnswer.find({ ...params }).select('rating time_taken').sort('-created'),
        AbortedQuestion.count({ ...params }),
        fetchOpGraphData(userId, questionType)
    ]);

    const ratingValues = answerDetails.map((details) => details.rating);

    const totalTimeSpent = answerDetails.reduce((time, details) => time + Number(details.time_taken), 0);

    const growth = ratingValues.length > 1
        ? `${calculateGrowth(...ratingValues.reverse().slice(ratingValues.length - 2))}%`
        : 'N/A';

    const highestRating = Math.max(...ratingValues);
    const lowestRating = Math.min(...ratingValues);

    const [correctAnswerStreak, wrongAnswerStreak] = await Promise.all([
        longestPositiveTrend(ratingValues),
        longestNegativeTrend(ratingValues)
    ]);

    return {
        questionType,
        totalCorrectAnswers,
        totalIncorrectAnswers,
        totalAnsweredQuestions: totalCorrectAnswers + totalIncorrectAnswers,
        abortedQuestions,
        highestRating,
        lowestRating,
        graphData,
        growth,
        correctAnswerStreak,
        wrongAnswerStreak,
        totalTimeSpent: formatTime(totalTimeSpent),
    };
};

const compileStats = async (request, response) => {
    try {
        const userId = request.query.user_id;
        const op = request.query.op;

        let selectedTypes = [];

        if (op) {
            selectedTypes.push(op);
        }

        else {
            const answeredQuestionTypes = await UserAnswer.find({ user_id: userId })
                .distinct('question_type');

            selectedTypes.push(...answeredQuestionTypes.slice(0, 2));
        }

        const stats = await Promise.all(selectedTypes.map((questionType) => fetchOpStats(userId, questionType)));
        console.log('Got stats: ', stats);

        return response.status(200).json(stats);
    } catch (error) {
        console.log(error);
        return response.status(400).json({
            error: errorHandler.getErrorMessage(error)
        });
    }
};

const fetchActiveOps = async (request, response) => {
    try {
        const result = await UserAnswer.find({ user_id: request.query.user_id })
            .distinct('question_type');

        console.log('returning active ops: ', result);

        return response.status(200).json(result);
    } catch (error) {
        console.log(error);
        return response.status(400).json({
            error: errorHandler.getErrorMessage(error)
        });
    }
};

module.exports = {
    fetchRatingHistory,
    fetchUserStats,
    compileStats,
    fetchActiveOps,
    fetchSpeedStats
};
