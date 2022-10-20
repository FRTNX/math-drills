export { };

const Question = require('../models/question.model');
const UserAnswer = require('../models/user.answer.model');

const errorHandler = require('./../helpers/db.error.handler');
const { config } = require('./../../config/config');

const addition = require('../operations/addition');
const subtraction = require('../operations/subtraction');

const multiplication = require('../operations/multiplication');
const division = require('../operations/division');

const logarithm = require('../operations/logarithm');
const primeFactorization = require('../operations/prime.factorization');

const lcm = require('../operations/lcm');
const hcf = require('../operations/hcf');

const fractions = require('../operations/fractions');
const decimals = require('../operations/decimals');

const percentage = require('../operations/percentage');
const scientificNotation = require('../operations/scientific.notation');

const exponents = require('../operations/exponents');
const radicals = require('../operations/radicals');

const summation = require('../operations/summation');
const monomials = require('../operations/monomials');

const got = require('got');

import { IQuestion, QuestionType } from './../models/model.types';
import { IRequest, IResponse } from './controller.types';

const removeSecrets = (question) => {
    question.correct_answer = undefined;
    question.base_award = undefined;
    question.time_award = undefined;
    question.time_penalty = undefined;
    question.created = undefined;
    question.__v = undefined; // mongoose generated
    return question;
};

const checkForExistingQuestion = async (operation: QuestionType, difficulty: number): Promise<IQuestion|false> => {
    const userAnswers = await UserAnswer.find({
        question_type: operation,
        question_difficulty: difficulty
    }).select('question_id');

    const answeredQuestionIds = userAnswers.map((answer) => answer.question_id.toString());

    const existingQuestion = await Question.findOne({
        question_type: operation,
        question_difficulty: Number(difficulty)
    });

    if (!existingQuestion) {
        return false;
    }

    const isAlreadyAnswered: boolean = answeredQuestionIds.includes(existingQuestion._id.toString());

    if (isAlreadyAnswered) {
        return false;
    }

    return existingQuestion;
};

const OPERATIONS_MAP = {
    addition: addition,
    subtraction: subtraction,
    multiplication: multiplication,
    division: division,
    fractions: fractions,
    decimals: decimals,
    prime_factorization: primeFactorization,
    lcm: lcm,
    hcf: hcf,
    exponents: exponents,
    scientific_notation: scientificNotation,
    radicals: radicals,
    summation: summation,
    percentage: percentage,
    logarithms: logarithm,
    monomials: monomials
};

// if there's no question in the db matching requested criterea
// or all such questions have already been answered by the user,
// let Drill Bot generate a new question, persist it, then send it
// to the user
const fetchQuestion = async (request: IRequest, response: IResponse): Promise<IResponse> => {
    try {
        // auxiliary: ping drillbot
        got(`${config.drillBotServer}?text=ping&&sessionId=1`);

        const operation: string = request.query.op;
        const difficulty: number = request.query.difficulty;

        // let questions accumilate for a few weeks before uncommenting
        // let question = await checkForExistingQuestion(operation, difficulty);
        // console.log('Found existing question: ', question)

        // if (question) {
        //     return response.status(200).json(removeSecrets(question));
        // }

        let question: Promise<IQuestion> = await OPERATIONS_MAP[operation].exec(operation, difficulty);

        question = removeSecrets(question);

        response.json(question);
    } catch (error) {
        console.log(error)
        return response.status(400).json({
            error: errorHandler.getErrorMessage(error)
        });
    }
};

const listOperations = (request: IRequest, response: IResponse): IResponse => {
    const operationsDetails = Object.keys(OPERATIONS_MAP).reduce((operations, operation) => ({
        ...operations, [operation]: OPERATIONS_MAP[operation].levels
    }), {});

    return response.json(operationsDetails);
};

const fetchTooltipMessage = async (request: IRequest, response: IResponse): Promise<IResponse> => {
    try {
        const [operation, difficulty]: [string, number] = [
            request.query.op,
            request.query.difficulty
        ];

        const message: string = OPERATIONS_MAP[operation].tooltips[difficulty];

        response.json({ message });
    } catch (error) {
        console.log(error)
        return response.status(400).json({
            error: errorHandler.getErrorMessage(error)
        });
    }
};

module.exports = {
    fetchQuestion,
    listOperations,
    fetchTooltipMessage
};
