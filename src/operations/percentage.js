const Question = require('../models/question.model');
const random = require('../helpers/random');

const DIFFICULTY_PROFILES = {
    0: {
        rateRange: [1, 100],
        baseRange: [1, 400],
        percentageRange: [1, 50],
        timeLimit: 20000,
        baseAward: 5,
        timeAward: 2,
        timePenalty: 1,
        displayType: 'plain'
    },
};

const percentage = async (operation, difficulty) => {
    const difficultyProfile = DIFFICULTY_PROFILES[difficulty];

    const variables = ['rate', 'base', 'percentage']; // obfuscatable values
    const valueToHide = variables[random(0, variables.length)];

    let questionLatex = '';
    let correctAnswer;

    if (valueToHide === 'rate') {
        const base = random(...difficultyProfile.baseRange);
        const percentage = random(...difficultyProfile.percentageRange);
        const rate = (percentage / base) * 100;

        questionLatex = `?% of ${base} = ${percentage}`;
        correctAnswer = rate;
    }

    if (valueToHide === 'base') {
        const rate = random(...difficultyProfile.rateRange);
        const percentage = random(...difficultyProfile.percentageRange);
        const base = percentage / (rate / 100);

        questionLatex = `${rate}% of ? = ${percentage}`;
        correctAnswer = base;
    }

    if (valueToHide === 'percentage') {
        const rate = random(...difficultyProfile.rateRange);
        const base = random(...difficultyProfile.baseRange);
        const percentage = (rate / 100) * base;

        questionLatex = `${rate}% of ${base} = ?`;
        correctAnswer = percentage;
    }

    const question = new Question({
        author: 'DrillBot',
        question_type: operation,
        question_difficulty: Number(difficulty),
        question_latex: questionLatex,
        correct_answer: Number(correctAnswer).toFixed(2),
        time_limit: difficultyProfile.timeLimit,
        base_award: difficultyProfile.baseAward,
        time_award: difficultyProfile.timeAward,
        time_penalty: difficultyProfile.timePenalty,
        display_type: difficultyProfile.displayType
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

    const message = `${difficultyProfile.tooltipIntro || ''}` +
        `You really ought to remember this: p = r(b); r = p/b; b = p/r. ` +
        `Bonus award time limit ${difficultyProfile.timeLimit / 1000} seconds.`

    return { [difficulty]: message };
});

module.exports = {
    exec: percentage,
    levels: Object.keys(DIFFICULTY_PROFILES).map((level) => Number(level)),
    tooltips: tooltips.reduce((data, value) => ({ ...data, ...value }), {})
};
