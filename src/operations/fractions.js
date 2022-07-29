const Question = require('../models/question.model');
const { generateQuestionLatex } = require('../helpers/evaluations');
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

    const formattedFractions = terms.map((fraction) => {
        const [numerator, denominator] = fraction;
        return `\\frac{${numerator}}{${denominator}}`;
    });

    const decimalFractions = terms.map((fraction) => fraction[0] / fraction[1]);

    const operator = difficultyProfile.ops[random(0, difficultyProfile.ops.length)];

    const options = { division: { styles: ['default'] }};
    const [questionLatex, correctAnswer] = generateQuestionLatex(operator, decimalFractions, formattedFractions, options);

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
