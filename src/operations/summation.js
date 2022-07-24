const Question = require('../models/question.model');
const random = require('../helpers/random');

const DIFFICULTY_PROFILES = {
    0: {
        lowerLimitRange: [1, 10],
        sequenceRange: [4, 6],
        timeLimit: 30000,
        baseAward: [5, 8],
        timeAward: 1,
        timePenalty: 3,
        tooltipIntro: 'This op is so you dont think Math Drills is soft. ' +
            'More complex ops on the way.'
    }
};

const summation = async (operation, difficulty) => {
    const difficultyProfile = DIFFICULTY_PROFILES[difficulty];

    let sum = 0;

    const lowerLimit = random(...difficultyProfile.lowerLimitRange);
    const sequenceLength = random(...difficultyProfile.sequenceRange);

    const upperLimit = lowerLimit + sequenceLength;

    const sequence = Array.from(
        { length: upperLimit - (lowerLimit -1) },
        (_, i) => (lowerLimit - 1) + 1 + i);

    // const ops = ['addition', 'subtraction', 'multiplication', 'division', 'exponent'];
    const ops = ['addition', 'exponent'];

    const op = ops[random(0, ops.length)];

    const variables = ['n', 'i'];
    const variable = variables[random(0, variables.length)];

    let rightSide = '';

    if (op == 'addition') {
        const addend = random(1, 5);
        rightSide = `${variable} + ${addend}`;
        sequence.map((n) => sum += n + addend);
    };

    if (op == 'exponent') {
        const exponent = random(2, 5);
        rightSide = `${variable}^${exponent}`;
        sequence.map((n) => sum += n ** exponent);
    }

    const questionLatex = `\\displaystyle\\sum_{${variable}=${lowerLimit}}^{${upperLimit}} ${rightSide}`;

    const question = new Question({
        author: 'DrillBot',
        question_type: operation,
        question_difficulty: Number(difficulty),
        question_latex: questionLatex,
        correct_answer: sum,
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
        `Bonus award time limit: ${difficultyProfile.timeLimit / 1000} seconds.`

    return { [difficulty]: message };
});

module.exports = {
    exec: summation,
    levels: Object.keys(DIFFICULTY_PROFILES).map((level) => Number(level)),
    tooltips: tooltips.reduce((data, value) => ({ ...data, ...value }), {})
};
