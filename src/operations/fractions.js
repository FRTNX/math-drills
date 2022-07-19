const Question = require('../models/question.model');
const random = require('../helpers/random');

const DIFFICULTY_PROFILES = {
    0: {
        numberOfFractions: 2,
        numeratorRange: [1, 50],
        denominatorRange: [1, 50],
        ops: ['addition', 'subtraction'],
        timeLimit: 60000,
        baseAward: [4, 6],
        timeAward: 1,
        timePenalty: 2,
        tooltipIntro: 'Beware of improper fractions.\n'
    },
    1: {
        numberOfFractions: 2,
        numeratorRange: [1, 80],
        denominatorRange: [1, 80],
        ops: ['addition', 'subtraction', 'multiplication', 'division'],
        timeLimit: 60000,
        baseAward: [5, 8],
        timeAward: 1,
        timePenalty: 2,
        tooltipIntro: 'Beware of really improper fractions.\n'
    }
};

const fractions = async (operation, difficulty) => {
    const difficultyProfile = DIFFICULTY_PROFILES[difficulty];

    const numberOfFractions = difficultyProfile.numberOfFractions

    // 3/4 and 1/2 in terms array would look like [[3, 4], [1, 2]]
    const terms = [];

    for (let i = 0; i < numberOfFractions; i++) {
        const numerator = random(...difficultyProfile.numeratorRange);
        const denominator = random(...difficultyProfile.denominatorRange);

        terms.push([numerator, denominator]);
    }

    const op = difficultyProfile.ops[random(0, difficultyProfile.ops.length)];

    const formattedFractions = terms.map((fraction) => {
        const [numerator, denominator] = fraction;
        return `\\frac{${numerator}}{${denominator}}`;
    });

    const decimalFractions = terms.map((fraction) => fraction[0] / fraction[1]);
    console.log('decimal fractions: ', decimalFractions)

    let questionLatex = '';
    let correctAnswer;

    if (op === 'addition') {
        correctAnswer = decimalFractions.reduce((sum, value) => sum + value, 0);
        questionLatex = formattedFractions.join(' + ');
    }

    if (op === 'subtraction') {
        correctAnswer = decimalFractions.slice(1).reduce((diff, value) => diff - value, decimalFractions[0]);
        questionLatex = formattedFractions.join(' - ');
    }

    if (op === 'multiplication') {
        correctAnswer = decimalFractions.reduce((partProd, value) => partProd * value, 1);

        let styles = ['default', 'dot', 'brackets'];
        const style = styles[random(0, styles.length)];

        if (style == 'default') {
            questionLatex = formattedFractions.join('\\times');
        }
    
        if (style == 'dot') {
            questionLatex = formattedFractions.join('\\cdot');
        }
    
        if (style == 'brackets') {
            factors = formattedFractions.map((fraction, index) => index === 0
                ? `${fraction}`
                : `\\left(${fraction}\\right)` );
        
            questionLatex = factors.join('');
        }
    }

    if (op === 'division') {
        correctAnswer = decimalFractions.slice(1).reduce((quotient, value) => quotient / value, decimalFractions[0]);
        questionLatex = formattedFractions.join('\\div');
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

const formatList = (strArray) => {
    const lastItem = strArray.slice(strArray.length - 1);
    return `${strArray.slice(0, strArray.length - 1).join(', ')} and ${lastItem}`;
};

const tooltips = Object.keys(DIFFICULTY_PROFILES).map((difficulty) => {
    const difficultyProfile = DIFFICULTY_PROFILES[difficulty];

    const message = `${difficultyProfile.tooltipIntro || ''}` +
        // `Numerator range: ${difficultyProfile.numeratorRange.join('-')}\n` +
        // `Denominator range: ${difficultyProfile.denominatorRange.join('-')}\n` +
        `Express the answer as a decimal rounded to 2 decimal places. ` +
        `Fraction ops: ${formatList(difficultyProfile.ops)}.\n` +
        `Bonus award time limit: ${difficultyProfile.timeLimit / 1000} seconds.`

    return { [difficulty]: message };
});

module.exports = {
    exec: fractions,
    levels: Object.keys(DIFFICULTY_PROFILES).map((level) => Number(level)),
    tooltips: tooltips.reduce((data, value) => ({ ...data, ...value }), {})
};
