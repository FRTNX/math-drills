export { };

const Question = require('../models/question.model');
const random = require('../helpers/random');

interface IQuestion {
    author: string,
    question_type: string,
    question_difficulty: number,
    question_latex: string,
    correct_answer: string | number,
    time_limit: number,
    base_award: number,
    time_award: number,
    time_penalty: number
}

const DIFFICULTY_PROFILES = {
    0: {
        logBaseRange: [1, 6],
        exponentRange: [0, 6],
        timeLimit: 20000,
        baseAward: [5, 8],
        timeAward: 2,
        timePenalty: 1,
        tooltipIntro: 'Good old logs.'
    }
};

const logarithm = async (operation: string, difficulty: number) : Promise<IQuestion> => {
    const difficultyProfile = DIFFICULTY_PROFILES[difficulty];

    const base: number= random(...difficultyProfile.logBaseRange);
    const exponent: number = random(...difficultyProfile.exponentRange);
    const result: number = base ** exponent;

    const questionLatex: string = `\\log_{${base}} ${result}`;

    const question = new Question({
        author: 'DrillBot',
        question_type: operation,
        question_difficulty: Number(difficulty),
        question_latex: questionLatex,
        correct_answer: `${exponent}`,
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

    const message: string = `${difficultyProfile.tooltipIntro || ''} ` +
        `These logs are generated using some novel backend kung fu ` +
        `Report buggy questions to the developer (hover mouse over copyright for contact detail)` +
        `Bonus award time limit: ${difficultyProfile.timeLimit / 1000} seconds.`

    return { [difficulty]: message };
});

module.exports = {
    exec: logarithm,
    levels: Object.keys(DIFFICULTY_PROFILES).map((level) => Number(level)),
    tooltips: tooltips.reduce((data, value) => ({ ...data, ...value }), {})
};
