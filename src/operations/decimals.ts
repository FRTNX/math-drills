export { };

const Question = require('../models/question.model');
const random = require('../helpers/random');

const { generateQuestionLatex } = require('../helpers/evaluations');

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
};

const DIFFICULTY_PROFILES = {
    0: {
        numberOfTerms: [1, 2],
        decimalRange: [1000, 10], // generates 0.1 to 9.9
        decimalPlaces: [1],
        exponents: [2, 3],
        operators: ['addition', 'subtraction', 'multiplication', 'division'],
        timeLimit: 30000,
        baseAward: [4, 6], 
        timeAward: 1,
        timePenalty: 2
    }
};

const decimals = async (operation: string, difficulty: number) : Promise<IQuestion> => {
    const difficultyProfile = DIFFICULTY_PROFILES[difficulty];

    const numberOfTerms: number = difficultyProfile.numberOfTerms[
        random(0, difficultyProfile.numberOfTerms.length)
    ];

    const terms: Array<number> = [];

    for (let i = 0; i < numberOfTerms; i++) {
        const [max, min]: [number, number] = difficultyProfile.decimalRange;
        const decimalPlaces: number = difficultyProfile.decimalPlaces[
            random(0, difficultyProfile.decimalPlaces.length)
        ];

        const decimal: number = Math.floor(Math.random() * (max - min) + min) / 100;

        terms.push(Number(decimal.toFixed(decimalPlaces)));
    }

    terms.map((decimal) => Number(decimal));

    let questionLatex: string = '';
    let correctAnswer: number;

    if (terms.length === 1) {
        const exponent: number = difficultyProfile.exponents[
            random(0, difficultyProfile.exponents.length)
        ];

        questionLatex = `${terms[0]}^{${exponent}}`;
        correctAnswer = terms[0] ** exponent;
    }

    if (terms.length > 1) {
        const operator: string = difficultyProfile.operators[
            random(0, difficultyProfile.operators.length)
        ];
    
        const options = { division: { styles: ['default'] }};
        const result: [string, number] = generateQuestionLatex(operator, terms, [], options);
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

    const message: string = `${difficultyProfile.tooltipIntro || ''} ` +
        `Express the answer as a decimal rounded to 2 decimal places where necessary. ` +
        `Bonus award time limit: ${difficultyProfile.timeLimit / 1000} seconds.`

    return { [difficulty]: message };
});

module.exports = {
    exec: decimals,
    levels: Object.keys(DIFFICULTY_PROFILES).map((level) => Number(level)),
    tooltips: tooltips.reduce((data, value) => ({ ...data, ...value }), {})
};
