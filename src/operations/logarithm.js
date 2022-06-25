const Question = require('../models/question.model');
const random = require('../helpers/random');

const DIFFICULTY_PROFILES = {
    0: {
        logBaseRange: [1, 6],
        exponentRange: [0, 6],
        timeLimit: 20000,
        baseAward: 5,
        timeAward: 2,
        timePenalty: 1
    }
};

const logarithm = async (operation, difficulty) => {
    const difficultyProfile = DIFFICULTY_PROFILES[difficulty];

    const base = random(...difficultyProfile.logBaseRange);
    const exponent = random(...difficultyProfile.exponentRange);
    const result = base ** exponent;

    const questionLatex = `\\log_{${base}} ${result}`;

    const question = new Question({
        author: 'DrillBot',
        question_type: operation,
        question_difficulty: Number(difficulty),
        question_latex: questionLatex,
        correct_answer: `${exponent}`,
        time_limit: difficultyProfile.timeLimit,
        base_award: difficultyProfile.baseAward,
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

module.exports = {
    exec: logarithm,
    levels: Object.keys(DIFFICULTY_PROFILES).map((level) => Number(level))
};
