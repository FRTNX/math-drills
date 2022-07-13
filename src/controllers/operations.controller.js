const Question = require('../models/question.model');
const UserAnswer = require('../models/user.answer.model');

const errorHandler = require('./../helpers/dbErrorHandler');

const addition = require('../operations/addition');
const subtraction = require('../operations/subtraction');

const multiplication = require('../operations/multiplication');
const division = require('../operations/division');

const logarithm = require('../operations/logarithm');
const primeFactorization = require('../operations/primeFactorization');

const summation = require('../operations/summation');
const lcm = require('../operations/lcm');
const hcf = require('../operations/hcf');

const fractions = require('../operations/fractions');
const percentage = require('../operations/percentage');

const removeSecrets = (question) => {
    question.correct_answer = undefined;
    question.base_award = undefined,
    question.time_award = undefined;
    question.time_penalty = undefined;
    question.created = undefined;
    question.__v = undefined; // mongoose generated
    return question;
};

const checkForExistingQuestion = async (operation, difficulty) => {
    const userAnswers = await UserAnswer.find({
        question_type: operation,
        question_difficulty: difficulty
    }).select('question_id');

    const answeredQuestionIds = userAnswers.map((answer) => answer.question_id.toString());

    const existingQuestion = await Question.findOne({
        question_type: operation,
        question_difficulty: Number(difficulty)
    });

    console.log('Found existing question: ', existingQuestion)

    if (!existingQuestion) {
        return false;
    }

    const isAlreadyAnswered = answeredQuestionIds.includes(existingQuestion._id.toString());
    console.log('is already answered:', isAlreadyAnswered)

    if (isAlreadyAnswered) {
        return false;
    }

    return existingQuestion;
};

const OPERATIONS_MAP = {
    logarithms: logarithm,
    addition: addition,
    subtraction: subtraction,
    multiplication: multiplication,
    division: division,
    prime_factorization: primeFactorization,
    summation: summation,
    lcm: lcm,
    hcf: hcf,
    fractions: fractions,
    percentage: percentage
};

// if there's no question in the db matching requested criterea
// or all such questions have already been answered by the user,
// let Drill Bot generate a new question, persist it, then send it
// to the user
const fetchQuestion = async (request, response) => {
    try {
        // await Question.deleteMany({}) // remove when ready

        const operation = request.query.op;
        const difficulty = request.query.difficulty;

        // let questions accumilate for a few weeks before uncommenting
        // let question = await checkForExistingQuestion(operation, difficulty);
        // console.log('Found existing question: ', question)

        // if (question) {
        //     return response.status(200).json(removeSecrets(question));
        // }
``
        question = await OPERATIONS_MAP[operation].exec(operation, difficulty);    

        question = removeSecrets(question);

        response.json(question);
    } catch (error) {
        console.log(error)
        return response.status(400).json({
            error: errorHandler.getErrorMessage(error)
        });
    }
};

const listOperations = (request, response) => {
    const operationsDetails = Object.keys(OPERATIONS_MAP).reduce((operations, operation) => ({
        ...operations, [operation]: OPERATIONS_MAP[operation].levels
    }), {});

    response.json(operationsDetails);
};

const fetchTooltipMessage = async (request, response) => {
    try {
        const [operation, difficulty] = [request.query.op, request.query.difficulty];
        // const operation = request.query.op;
        // const difficulty = request.query.difficulty;

        const message = OPERATIONS_MAP[operation].tooltips[difficulty];

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
