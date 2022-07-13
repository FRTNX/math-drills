const Question = require('../models/question.model');
const random = require('../helpers/random');

const DIFFICULTY_PROFILES = {
    0: {
        quotientRange: [2, 20],
        divisorRange: [10, 30],
        timeLimit: 20000, // millis
        baseAward: 5,
        timeAward: 2,
        timePenalty: 1,
    },
    0: {
        quotientRange: [-2, 20],
        divisorRange: [-10, 30],
        timeLimit: 20000, // todo: adjust values accordingly
        baseAward: 5,
        timeAward: 2,
        timePenalty: 1
    },
    1: {
        quotientRange: [-20, 50],
        divisorRange: [-10, 50],
        timeLimit: 20000,
        baseAward: 5,
        timeAward: 2,
        timePenalty: 1
    },
    2: {
        quotientRange: [-50, 50],
        divisorRange: [-50, 50],
        timeLimit: 20000,
        baseAward: 5,
        timeAward: 2,
        timePenalty: 1
    }
};

const division = async (operation, difficulty) => {
    const difficultyProfile = DIFFICULTY_PROFILES[difficulty];

    const quotient = random(...difficultyProfile.quotientRange);
    const divisor = random(...difficultyProfile.divisorRange);

    const dividend = quotient * divisor;

    const styles = ['default', 'fraction'];
    const style = styles[random(0, styles.length)];

    let questionLatex = '';

    if (style == 'default') {
        const formattedTerms = [dividend, divisor].map((term) => term < 0 ? `(${term})` : `${term}`);
        questionLatex = formattedTerms.join('\\div');
    }

    if (style == 'fraction') {
        questionLatex = `\\frac{${dividend}}{${divisor}}`
    }

    const question = new Question({
        author: 'DrillBot',
        question_type: operation,
        question_difficulty: Number(difficulty),
        question_latex: questionLatex,
        correct_answer: quotient,
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

const tooltips = Object.keys(DIFFICULTY_PROFILES).map((difficulty) => {
    const difficultyProfile = DIFFICULTY_PROFILES[difficulty];

    const message = `${difficultyProfile.tooltipIntro || ''}` +
        `Where solo fractions appear simply perform the indicated division. ` +
        `Bonus award time limit ${difficultyProfile.timeLimit / 1000} seconds.`

    return { [difficulty]: message };
});

module.exports = {
    exec: division,
    levels: Object.keys(DIFFICULTY_PROFILES).map((level) => Number(level)),
    tooltips: tooltips.reduce((data, value) => ({ ...data, ...value }), {})
};
