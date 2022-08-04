export { };

const User = require('../models/user.model');
const UserAnswer = require('../models/user.answer.model');

const AbortedQuestion = require('../models/aborted.question.model');

const errorHandler = require('./../helpers/db.error.handler');

import { IRequest, IResponse } from './controller.types';

const fetchRatingProfile = (userRatings: Array<number>, activeOperation: boolean) => {
    if (!activeOperation) {
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

const fetchRatingHistory = async (request: IRequest, response: IResponse): Promise<IResponse> => {
    try {
        if (!request.query.user_id || !request.query.question_type) {
            throw new Error('Invalid rating request');
        }

        let query = {
            user_id: request.query.user_id,
            question_type: request.query.question_type
        };

        const limit: number = request.query.limit
            ? request.query.limit
            : 10

        let userAnswers = await UserAnswer.find(query)
            .select('rating created')
            .sort('-created')
            .limit(limit)
            .exec();

        const isActiveOp: boolean = await UserAnswer.exists({ ...query, user_answer: { '$ne': 'randomized' } });

        const userRating = userAnswers.map((r) => r.rating);
        const ratingProfile = fetchRatingProfile(userRating, isActiveOp);

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

const fetchUserStats = async (request: IRequest, response: IResponse): Promise<IResponse> => {
    try {
        const userId: string = request.query.user_id;
        const user = await User.findOne({ _id: userId }).select('name');

        const totalAnsweredQuestions: number = await UserAnswer.count({ user_id: userId });

        const questionTypes = await UserAnswer.find({ user_id: userId })
            .distinct('question_type');

        const userAnswerDetails: any = await Promise.all(questionTypes.map(async (questionType) => {
            const answerRatings = await UserAnswer.find({ user_id: userId, question_type: questionType }).select('rating').sort('-created');
            const ratingValues = answerRatings.map((answerRating) => answerRating.rating);

            const isMastered: boolean = ratingValues[ratingValues.length - 1] > 200; // eventually read from op settings table

            const growth: number = ratingValues.length > 1
                ? calculateGrowth(...ratingValues.reverse().slice(ratingValues.length - 2))
                : 0;

            const highestRating: number = Math.max(...ratingValues);
            const lowestRating: number = Math.min(...ratingValues);

            return { questionType, ratingValues, growth, highestRating, lowestRating, isMastered };
        }));

        let bestOp = { questionType: '', highestRating: 0 };

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

        const masteredOps: number = userAnswerDetails.reduce((partCount, details) => {
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

const fetchOpGraphData = async (userId: string, questionType: string) => {
    const query = {
        user_id: userId,
        question_type: questionType
    };

    const questionRatings = await UserAnswer.find(query)
        .select('rating created')
        .sort('-created')
        .limit(11)
        .exec();

    const isActiveOp: boolean = await UserAnswer.exists({ ...query, user_answer: { '$ne': 'randomized' } });

    const ratingValues = questionRatings.map((r) => r.rating).reverse();
    const ratingProfile = fetchRatingProfile(ratingValues, isActiveOp);

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

const calculateGrowth = (valueA?: number, valueB?: number) => Math.round(((valueB - valueA) / valueA) * 100);

const formatTime = (millis: number): string => {
    console.log('Got millis: ', millis)
    // ms
    if (millis < 1000) {
        return `${millis}ms`;
    }

    // s
    if (millis > 1000 && millis < 1000 * 60) {
        let sec = Math.round(millis / 1000)
        let ms = Number(`${millis % 1000}`.slice(0, 2));

        if (Number(ms) > 60) {
            sec += 1;
            ms -= 60
        }

        return `${sec}.${ms}s`
    }

    // m
    if (millis > 1000 * 60 && millis < 1000 * 60 * 60) {
        let min = Math.round(millis / (1000 * 60))
        let sec = Number(`${millis % (1000 * 60)}`.slice(0, 2));

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

const longestPositiveTrend = async (numArray: Array<number>): Promise<number> => {
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

const longestNegativeTrend = async (numArray: Array<number>): Promise<number> => {
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

const fetchSpeedStats = async (request: IRequest, response: IResponse): Promise<IResponse> => {
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

        const averageSpeed: number = speedValues.reduce((partSum, value) => partSum + Number(value), 0) / speedValues.length;
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

        return response.status(200).json(result);
    } catch (error) {
        console.log(error);
        return response.status(400).json({
            error: errorHandler.getErrorMessage(error)
        });
    }
};

const fetchOpStats = async (userId: string, questionType: string) => {
    const params = { user_id: userId, question_type: questionType };

    const [totalCorrectAnswers, totalIncorrectAnswers, answerDetails, abortedQuestions, graphData] = await Promise.all([
        UserAnswer.count({ ...params, is_correct: true }),
        UserAnswer.count({ ...params, is_correct: false }),
        UserAnswer.find({ ...params }).select('rating time_taken').sort('-created'),
        AbortedQuestion.count({ ...params }),
        fetchOpGraphData(userId, questionType)
    ]);

    const ratingValues = answerDetails.map((details) => details.rating);

    const totalTimeSpent: number = answerDetails.reduce((time, details) => time + Number(details.time_taken), 0);

    const growth: string = ratingValues.length > 1
        ? `${calculateGrowth(...ratingValues.reverse().slice(ratingValues.length - 2))}%`
        : 'N/A';

    const highestRating: number = Math.max(...ratingValues);
    const lowestRating: number = Math.min(...ratingValues);

    const [correctAnswerStreak, wrongAnswerStreak]: [number, number] = await Promise.all([
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

const compileStats = async (request: IRequest, response: IResponse): Promise<IResponse> => {
    try {
        const userId: string = request.query.user_id;
        const op: string = request.query.op;

        let selectedTypes: Array<string> = [];

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

const fetchActiveOps = async (request: IRequest, response: IResponse): Promise<IResponse> => {
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
