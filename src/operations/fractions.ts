export { };

const Question = require('../models/question.model');
const random = require('../helpers/random');

const { generateQuestionLatex } = require('../helpers/evaluations');
import { IQuestion } from './../models/model.types';

const DIFFICULTY_PROFILES = {
    0: {
        numberOfFractions: 2,
        numeratorRange: [1, 50],
        denominatorRange: [1, 50],
        operators: ['addition', 'subtraction'],
        timeLimit: 60000,
        baseAward: [4, 6],
        timeAward: 1,
        timePenalty: 2,
        tooltipIntro: 'Beware of improper fractions.\n'
    },
    1: {
        numberOfFractions: 2,
        numeratorRange: [-20, 80],
        denominatorRange: [-20, 80],
        operators: ['addition', 'subtraction', 'multiplication', 'division'],
        timeLimit: 60000,
        baseAward: [5, 8],
        timeAward: 1,
        timePenalty: 2,
        tooltipIntro: 'Beware of really improper fractions.\n'
    }
};

const fractions = async (operation: string, difficulty: number): Promise<IQuestion> => {
    const difficultyProfile = DIFFICULTY_PROFILES[difficulty];

    const numberOfFractions: number = difficultyProfile.numberOfFractions

    // 3/4 and 1/2 in terms array would look like [[3, 4], [1, 2]]
    const terms: Array<Array<number>> = [];

    for (let i = 0; i < numberOfFractions; i++) {
        const numerator: number = random(...difficultyProfile.numeratorRange);
        const denominator: number = random(...difficultyProfile.denominatorRange);

        terms.push([numerator, denominator]);
    }

    const formattedFractions = terms.map((fraction) => {
        const [numerator, denominator] = fraction;
        return `\\frac{${numerator}}{${denominator}}`;
    });

    const decimalFractions = terms.map((fraction) => fraction[0] / fraction[1]);

    const operator: string = difficultyProfile.operators[
        random(0, difficultyProfile.operators.length)
    ];

    const options = { division: { styles: ['default'] }};
    const [questionLatex, correctAnswer]: [number, string] = generateQuestionLatex(
        operator, decimalFractions, formattedFractions, options);

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
        // `Numerator range: ${difficultyProfile.numeratorRange.join('-')}\n` +
        // `Denominator range: ${difficultyProfile.denominatorRange.join('-')}\n` +
        `Express the answer as a decimal rounded to 2 decimal places. ` +
        `Bonus award time limit: ${difficultyProfile.timeLimit / 1000} seconds.`

    return { [difficulty]: message };
});

module.exports = {
    exec: fractions,
    levels: Object.keys(DIFFICULTY_PROFILES).map((level) => Number(level)),
    tooltips: tooltips.reduce((data, value) => ({ ...data, ...value }), {})
};
