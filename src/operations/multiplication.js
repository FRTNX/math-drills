const Question = require('../models/question.model');
const random = require('../helpers/random');

const DIFFICULTY_PROFILES = {
    0: {
        range: [3, 30],
        numberOfTerms: 2,
        timeLimit: 20000,
        baseAward: [4, 6],
        timeAward: 2,
        timePenalty: 1,
        tooltipIntro: 'Hasty addition.'
    },
    1: {
        range: [-50, 50],
        numberOfTerms: 2,
        timeLimit: 20000,
        baseAward: [5, 8],
        timeAward: 2,
        timePenalty: 1,
        tooltipIntro: 'Like signs have so much positivity...'
    }
};

const multiplication = async (operation, difficulty) => {
    const difficultyProfile = DIFFICULTY_PROFILES[difficulty];

    const factors = [];
    const numberOfTerms = difficultyProfile.numberOfTerms;

    for (let i = 0; i < numberOfTerms; i ++) {
        const factor = random(...difficultyProfile.range);
        factors.push(factor);
    }

    const product = factors.reduce((partProd, value) => partProd * value, 1);

    let formattedFactors = factors.map((factor) => factor < 0 ? `(${factor})` : `${factor}`);

    let styles = ['default', 'dot'];
    
    if (Number(difficulty) === 0) {
        styles.push('brackets');
    };

    const style = styles[random(0, styles.length)];

    let questionLatex = '';

    if (style == 'default') {
        questionLatex = formattedFactors.join('\\times');
    }

    if (style == 'dot') {
        questionLatex = formattedFactors.join('\\cdot');

    }

    if (style == 'brackets') {
        formattedFactors = factors.map((factor, index) => index === 0 ? `${factor}`: `\\big(${factor}\\big)` );
        questionLatex = formattedFactors.join('');
    }

    const question = new Question({
        author: 'DrillBot',
        question_type: operation,
        question_difficulty: Number(difficulty),
        question_latex: questionLatex,
        correct_answer: product,
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

    const message = `${difficultyProfile.tooltipIntro || ''}` +
    `Typically ${difficultyProfile.numberOfTerms} factors, ` +
    `ranging from ${difficultyProfile.range[0]} to ${difficultyProfile.range[1]}. ` +
    `Bonus award time limit ${difficultyProfile.timeLimit / 1000} seconds.`


    return { [difficulty]: message };
});

module.exports = {
    exec: multiplication,
    levels: Object.keys(DIFFICULTY_PROFILES).map((level) => Number(level)),
    tooltips: tooltips.reduce((data, value) => ({ ...data, ...value }), {})
};
