const Question = require('../models/question.model');
const random = require('../helpers/random');

const DIFFICULTY_PROFILES = {
    0: {
        range: [3, 30],
        numberOfTerms: 2,
        timeLimit: 20000,
        baseAward: 5,
        timeAward: 2,
        timePenalty: 1
    },
    1: {
        range: [-50, 50],
        numberOfTerms: 2,
        timeLimit: 20000,
        baseAward: 5,
        timeAward: 2,
        timePenalty: 1
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
    exec: multiplication,
    levels: Object.keys(DIFFICULTY_PROFILES).map((level) => Number(level))
}
