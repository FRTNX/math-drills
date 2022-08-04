
export { };

const Question = require('../models/question.model');
const random = require('../helpers/random');

const { generateQuestionLatex } = require('../helpers/evaluations');

import { IQuestion } from './../models/model.types';

const DIFFICULTY_PROFILES = {
    0: {
        numberOfTerms: [1, 2],
        factorRange: [1, 10], // multiplicands, including decimals
        exponents: [-9, 10], // powers of 10
        multiplicandParams: [1000, 10],
        operators: ['multiplication', 'division'],
        obfuscation: ['none'],
        timeLimit: 60000,
        baseAward: [4, 6],
        timeAward: 1,
        timePenalty: 2,
        tooltipIntro: 'The distances between stars and the lengths of nano particles.\n'
    },
    1: {
        numberOfTerms: [1, 2],
        factorRange: [1, 15],
        exponents: [-15, 16],
        multiplicandParams: [10000, 10],
        operators: ['multiplication', 'division'],
        obfuscation: ['none'],
        timeLimit: 60000,
        baseAward: [5, 8],
        timeAward: 1,
        timePenalty: 2,
        tooltipIntro: 'From subatomic quantum disturbances to the Andromeda galaxy and beyond.\n'
    }
};

const scientific_notation = async (operation: string, difficulty: number): Promise<IQuestion> => {
    const difficultyProfile = DIFFICULTY_PROFILES[difficulty];

    const terms: Array<number> = [];
    const formattedTerms: Array<string> = [];

    const numberOfTerms = difficultyProfile.numberOfTerms[
        random(0, difficultyProfile.numberOfTerms.length)
    ];

    for (let i = 0; i < numberOfTerms; i++) {
        const [max, min]: [number, number] = difficultyProfile.multiplicandParams;
        const multiplicand: string = Number(Math.floor(Math.random() * (max - min) + min) / 100).toFixed(1);
        const exponent: number = random(...difficultyProfile.exponents);

        terms.push(Number(multiplicand) * 10 ** exponent);
        formattedTerms.push(`${multiplicand} \\times 10^{${exponent}}`);
    }

    let questionLatex: string;
    let correctAnswer: number;

    if (terms.length === 1) {
        questionLatex = formattedTerms[0];
        correctAnswer = terms[0];
    }

    if (terms.length > 1) {
        const operator: string = difficultyProfile.operators[
            random(0, difficultyProfile.operators.length)
        ];
    
        const options = { division: { styles: ['fraction'] }};
        const result: [string, number] = generateQuestionLatex(operator, terms, formattedTerms, options);
        questionLatex = result[0];
        correctAnswer = result[1];
    }

    const question = new Question({
        author: 'DrillBot',
        question_type: operation,
        question_difficulty: Number(difficulty),
        question_latex: questionLatex,
        correct_answer: Number(correctAnswer).toFixed(2),
        time_limit: difficultyProfile.timeLimit,
        base_award: random(...difficultyProfile.baseAward),
        time_award: difficultyProfile.timeAward,
        time_penalty: difficultyProfile.timePenalty
    });

    const existingQuestion = await Question.findOne({
        question_type: operation,
        question_difficulty: difficulty,
        question_latex: questionLatex
    });

    if (existingQuestion) {
        return existingQuestion;
    }

    try {
        await question.save();
    } catch (error) {
        console.log(error);
    }

    console.log('Created new question: ', question);

    return question;
};

const tooltips = Object.keys(DIFFICULTY_PROFILES).map((difficulty) => {
    const difficultyProfile = DIFFICULTY_PROFILES[difficulty];

    const message: string = `${difficultyProfile.tooltipIntro || ''}` +
        `Round the result to 2 decimal places. ` +
        `Bonus award time limit: ${difficultyProfile.timeLimit / 1000} seconds.`

    return { [difficulty]: message };
});

module.exports = {
    exec: scientific_notation,
    levels: Object.keys(DIFFICULTY_PROFILES).map((level) => Number(level)),
    tooltips: tooltips.reduce((data, value) => ({ ...data, ...value }), {})
};
