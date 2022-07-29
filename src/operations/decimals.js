const Question = require('../models/question.model');
const { generateQuestionLatex } = require('../helpers/evaluations');

const random = require('../helpers/random');

const DIFFICULTY_PROFILES = {
    0: {
        numberOfTerms: [1, 2],
        decimalRange: [1000, 10], // generates 0.1 to 9.9
        decimalPlaces: [1],
        exponents: [2, 3],
        ops: ['addition', 'subtraction', 'multiplication', 'division'],
        timeLimit: 30000,
        baseAward: [4, 6], 
        timeAward: 1,
        timePenalty: 2
    }
};

const decimals = async (operation, difficulty) => {
    const difficultyProfile = DIFFICULTY_PROFILES[difficulty];

    const numberOfTerms = difficultyProfile.numberOfTerms[
        random(0, difficultyProfile.numberOfTerms.length)
    ];

    const terms = [];

    for (let i = 0; i < numberOfTerms; i++) {
        const [max, min] = difficultyProfile.decimalRange;
        const decimalPlaces = difficultyProfile.decimalPlaces[
            random(0, difficultyProfile.decimalPlaces.length)
        ];

        const decimal = Math.floor(Math.random() * (max - min) + min) / 100;

        terms.push(Number(decimal.toFixed(decimalPlaces)));
    }

    terms.map((decimal) => Number(decimal));

    let questionLatex = '';
    let correctAnswer;

    if (terms.length === 1) {
        const exponent = difficultyProfile.exponents[
            random(0, difficultyProfile.exponents.length)
        ];

        questionLatex = `${terms[0]}^{${exponent}}`;
        correctAnswer = terms[0] ** exponent;
    }

    const operator = difficultyProfile.ops[random(0, difficultyProfile.ops.length)];

    if (terms.length > 1) {
        const options = { division: { styles: ['default'] }};
        const result = generateQuestionLatex(operator, terms, [], options);
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

    const message = `${difficultyProfile.tooltipIntro || ''} ` +
        `Express the answer as a decimal rounded to 2 decimal places where necessary. ` +
        `Bonus award time limit: ${difficultyProfile.timeLimit / 1000} seconds.`

    return { [difficulty]: message };
});

module.exports = {
    exec: decimals,
    levels: Object.keys(DIFFICULTY_PROFILES).map((level) => Number(level)),
    tooltips: tooltips.reduce((data, value) => ({ ...data, ...value }), {})
};
