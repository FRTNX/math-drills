const Question = require('../models/question.model');
const { generateQuestionLatex } = require('../helpers/evaluations');

const random = require('../helpers/random');

const DIFFICULTY_PROFILES = {
    0: {
        numberOfTerms: [1],
        rootRange: [1, 30],
        indices: [2], // square roots
        ops: [],
        obfuscation: ['none'],
        timeLimit: 7000,
        baseAward: [4, 6],
        timeAward: 1,
        timePenalty: 2,
        tooltipIntro: 'Square roots, confer truth, over you.\n'
    },
    1: {
        numberOfTerms: [1],
        rootRange: [1, 15],
        indices: [3], // cube roots
        ops: [],
        obfuscation: ['none'],
        timeLimit: 8000,
        baseAward: [4, 6],
        timeAward: 1,
        timePenalty: 2,
        tooltipIntro: 'Cube roots for my valentine.\n'
    },
    2: {
        numberOfTerms: [1, 2],
        rootRange: [1, 15],
        indices: [2, 3],
        ops: ['addition', 'subtraction', 'multiplication', 'division'],
        obfuscation: ['none'],
        timeLimit: 20000,
        baseAward: [4, 6],
        timeAward: 1,
        timePenalty: 2,
        tooltipIntro: 'Squares, cubes, free for all.\n'
    }
};

const radicals = async (operation, difficulty) => {
    const difficultyProfile = DIFFICULTY_PROFILES[difficulty];

    const numberOfTerms = difficultyProfile.numberOfTerms[
        random(0, difficultyProfile.numberOfTerms.length)
    ];

    const terms = [];
    const formattedTerms = [];

    for (let i = 0; i < numberOfTerms; i ++) {
        const root = random(...difficultyProfile.rootRange);
        const index = difficultyProfile.indices[random(0, difficultyProfile.indices.length)];
    
        const radicand = root ** index;

        index === 2
            ? formattedTerms.push(`\\sqrt{${radicand}}`)
            : formattedTerms.push(`\\sqrt[${index}]{${radicand}}`);

        terms.push(root);
    }

    let questionLatex = '';
    let correctAnswer;

    if (terms.length === 1) {
        questionLatex = formattedTerms[0];
        correctAnswer = terms[0];
    }

    const operator = difficultyProfile.ops[random(0, difficultyProfile.ops.length)];

    if (terms.length > 1) {
        const options = { division: { styles: ['fraction'] }};
        const result = generateQuestionLatex(operator, terms, formattedTerms, options);
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

    const message = `${difficultyProfile.tooltipIntro || ''}` +
        `Bonus award time limit: ${difficultyProfile.timeLimit / 1000} seconds.`

    return { [difficulty]: message };
});

module.exports = {
    exec: radicals,
    levels: Object.keys(DIFFICULTY_PROFILES).map((level) => Number(level)),
    tooltips: tooltips.reduce((data, value) => ({ ...data, ...value }), {})
};
