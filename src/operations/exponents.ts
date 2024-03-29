export { };

const Question = require('../models/question.model');
const random = require('../helpers/random');

const { generateQuestionLatex } = require('../helpers/evaluations');

import { IQuestion } from './../models/model.types';

const DIFFICULTY_PROFILES = {
    0: {
        numberOfTerms: [1, 2],
        factorRange: [1, 30],
        exponents: [1, 2], // squares; the first exponent must always be 1, for all levels
        operators: ['addition', 'subtraction', 'multiplication', 'division'],
        obfuscation: ['none'],
        timeLimit: 7000,
        baseAward: [4, 6],
        timeAward: 1,
        timePenalty: 2,
        tooltipIntro: 'Square up!\n'
    },
    1: {
        numberOfTerms: [1, 2],
        factorRange: [1, 15],
        exponents: [1, 3], // + cubes
        operators: ['addition', 'subtraction', 'multiplication', 'division'],
        obfuscation: ['none'],
        timeLimit: 8000,
        baseAward: [5, 8],
        timeAward: 1,
        timePenalty: 2,
        tooltipIntro: 'Everything cubes.\n'
    },
    2: {
        numberOfTerms: [1, 2],
        factorRange: [1, 30],
        exponents: [1, 2, 3, 0, -1, -2, -3], // + negatives and 0
        operators: ['addition', 'subtraction', 'multiplication', 'division'],
        obfuscation: ['none'],
        timeLimit: 15000,
        baseAward: [5, 8],
        timeAward: 1,
        timePenalty: 2,
        tooltipIntro: 'Sqaures, cubes, negatives, and zero as an exponent. Such fun.\n'
    },
    3: {
        numberOfTerms: [1, 2],
        factorRange: [1, 10], // multiplicands, including decimals
        exponents: [-9, 10], // range of powers of 10
        operators: ['multiplication', 'division'],
        override: 'SCIENTIFIC_NOTATION',
        obfuscation: ['none'],
        timeLimit: 60000,
        baseAward: [5, 8],
        timeAward: 1,
        timePenalty: 2,
        tooltipIntro: 'Powers of 10 aka combat squads aka scientific notation.\n'
    },
    4: {
        numberOfTerms: [1, 2],
        factorRange: [1, 30],
        exponents: [1, 'fraction'],
        operators: ['addition', 'subtraction', 'multiplication', 'division'],
        obfuscation: ['none'],
        indexRange: [-3, -2, -1, 1, 2, 3], // required where 'fraction' is an exponent
        rootRange: [-3, -2, -1, 1, 2, 3], // required where 'fraction' is an exponent
        timeLimit: 30000,
        baseAward: [5, 8],
        timeAward: 1,
        timePenalty: 2,
        tooltipIntro: 'Fractional exponents. As above, so not below. Power over roots. Roots before power.\n'
    },
    5: {
        numberOfTerms: [1, 2],
        factorRange: [1, 30],
        exponents: [1, 2, 3, 0, -1, -2, -3, 'fraction'], // all together now
        operators: ['addition', 'subtraction', 'multiplication', 'division'],
        obfuscation: ['none'],
        indexRange: [-3, -2, -1, 1, 2, 3],
        rootRange: [-3, -2, -1, 1, 2, 3],
        timeLimit: 30000,
        baseAward: [5, 8],
        timeAward: 1,
        timePenalty: 2,
        tooltipIntro: 'The whole enchelada.\n'
    }
};

const exponents = async (operation: string, difficulty: number): Promise<IQuestion> => {
    const difficultyProfile = DIFFICULTY_PROFILES[difficulty];

    const terms: Array<number> = [];
    const formattedTerms: Array<string> = [];

    let hasExponent: boolean = false;

    const numberOfTerms: number = difficultyProfile.numberOfTerms[
        random(0, difficultyProfile.numberOfTerms.length)
    ];

    for (let i = 0; i < numberOfTerms; i++) {
        if (difficultyProfile.override) {
            if (difficultyProfile.override === 'SCIENTIFIC_NOTATION') {
                const exponent: number = random(...difficultyProfile.exponents);

                // generates a decimal ranging from 0.01 to 9.99
                const multiplicand: number = Math.floor(Math.random() * (1000 - 10) + 10) / 100;

                terms.push(multiplicand * 10 ** exponent);
                formattedTerms.push(`${multiplicand} \\times 10^{${exponent}}`);
                continue;
            }
        }

        const base: number = random(...difficultyProfile.factorRange);

        let exponent = numberOfTerms > 1
            ? difficultyProfile.exponents[random(0, difficultyProfile.exponents.length)]
            : difficultyProfile.exponents[random(1, difficultyProfile.exponents.length)]; // ensures solo exponents always have a power greater than 1

        if (exponent !== 1) {
            hasExponent = true;
        }

        // if this is the last term and no exponent has been used
        // so far, force the use of an exponent greater than one within difficulty range
        if (i === numberOfTerms - 1 && !hasExponent) {
            exponent = difficultyProfile.exponents[random(1, difficultyProfile.exponents.length)];
        }

        // holds the decimal value of fractional exponents
        let exponentValue: number;

        if (exponent === 'fraction') {
            const numerator: number = difficultyProfile.indexRange[
                random(0, difficultyProfile.indexRange.length)
            ];

            const denominator: number = difficultyProfile.rootRange[
                random(0, difficultyProfile.rootRange.length)
            ];

            exponent = `\\frac{${numerator}}{${denominator}}`;
            exponentValue = numerator / denominator;
        }

        exponent !== 1
            ? formattedTerms.push(`${base}^{${exponent}}`)
            : formattedTerms.push(`${base}`);

        exponentValue
            ? terms.push(base ** exponentValue)
            : terms.push(base ** exponent);
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

        const result: [string, number] = generateQuestionLatex(operator, terms, formattedTerms);
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
        `Bonus award time limit: ${difficultyProfile.timeLimit / 1000} seconds.`

    return { [difficulty]: message };
});

module.exports = {
    exec: exponents,
    levels: Object.keys(DIFFICULTY_PROFILES).map((level) => Number(level)),
    tooltips: tooltips.reduce((data, value) => ({ ...data, ...value }), {})
};
