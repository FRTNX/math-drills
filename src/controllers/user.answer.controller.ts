export { };

const UserAnswer = require('../models/user.answer.model');

const Question = require('../models/question.model');
const AbortedQuestion = require('../models/aborted.question.model');

const errorHandler = require('./../helpers/db.error.handler');
const evaluations = require('./../helpers/evaluations');

import { IRequest, IResponse } from './controller.types';

const saveUserAnswer = async (request: IRequest, response: IResponse): Promise<IResponse> => {
    try {
        console.log('Got user answer: ', request.body)
        const question = await Question.findOne({ _id: request.body.question_id });

        const answer = evaluations.evaluateAnswer(question, request.body);

        const params = {
            user_id: request.body.user_id,
            question_type: request.body.question_type
        };

        const lastRelatedAnswer = await UserAnswer.find(params)
            .select('rating')
            .sort('-created')
            .limit(1)
            .exec();

        const timeTaken: number = request.body.time_taken;

        let currentRating = 0;
        lastRelatedAnswer.length > 0
            ? currentRating = lastRelatedAnswer[0].rating
            : '';

        if (!answer.isCorrect) {
            currentRating -= question.base_award;
        }

        else {
            let baseAward: number = question.base_award;

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

        // todo: check for previously aborted question, remove if exists

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

const abortQuestion = async (request: IRequest, response: IResponse): Promise<IResponse> => {
    try {
        const userId = request.query.user_id;
        const questionId = request.query.question_id;

        const question = await Question.findOne({ _id: questionId });

        if (!question) {
            throw new Error('Question not found');
        }

        try {
            const abortedQuestion = new AbortedQuestion({
                user_id: userId,
                question_id: question._id,
                question_type: question.question_type
            });

            await abortedQuestion.save();
        } catch (error) {
            console.log(error);
        }

        return response.status(200).json({ result: 'SUCCESS' });
    } catch (error) {
        console.log(error);
        return response.status(400).json({
            error: errorHandler.getErrorMessage(error)
        });
    }
};

const fetchUserAnswers = async (request: IRequest, response: IResponse): Promise<IResponse> => {
    try {
        let query = { user_id: request.query.user_id, question_type: '' };

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

module.exports = {
    saveUserAnswer,
    fetchUserAnswers,
    abortQuestion
};
