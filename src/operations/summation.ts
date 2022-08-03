export { };

const Question = require('../models/question.model');
const random = require('../helpers/random');

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
}

const DIFFICULTY_PROFILES = {
    0: {
        operators:  ['addition', 'exponent'],
        lowerLimitRange: [1, 10],
        sequenceRange: [4, 6],
        timeLimit: 30000,
        baseAward: [5, 8],
        timeAward: 1,
        timePenalty: 3,
        tooltipIntro: 'This op is so you dont think Math Drills is soft. ' +
            'More complex operators on the way.'
    }
};

const summation = async (operation: string, difficulty: number) : Promise<IQuestion> => {
    const difficultyProfile = DIFFICULTY_PROFILES[difficulty];

    let sum: number = 0;

    const lowerLimit: number = random(...difficultyProfile.lowerLimitRange);
    const sequenceLength: number = random(...difficultyProfile.sequenceRange);

    const upperLimit: number = lowerLimit + sequenceLength;

    const sequence: Array<number> = Array.from(
        { length: upperLimit - (lowerLimit -1) },
        (_, i) => (lowerLimit - 1) + 1 + i);

    const operator: string = difficultyProfile.operators[
        random(0, difficultyProfile.operators.length)
    ];

    const variables: Array<string> = ['n', 'i'];
    const variable: string = variables[random(0, variables.length)];

    let rightSide: string;

    if (operator == 'addition') {
        const addend: number = random(1, 5);
        rightSide = `${variable} + ${addend}`;
        sequence.map((n) => sum += n + addend);
    };

    if (operator == 'exponent') {
        const exponent: number = random(2, 5);
        rightSide = `${variable}^${exponent}`;
        sequence.map((n) => sum += n ** exponent);
    }

    const questionLatex: string = `\\displaystyle\\sum_{${variable}=${lowerLimit}}^{${upperLimit}} ${rightSide}`;

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

    const message: string = `${difficultyProfile.tooltipIntro || ''} ` +
        `Bonus award time limit: ${difficultyProfile.timeLimit / 1000} seconds.`

    return { [difficulty]: message };
});

module.exports = {
    exec: summation,
    levels: Object.keys(DIFFICULTY_PROFILES).map((level) => Number(level)),
    tooltips: tooltips.reduce((data, value) => ({ ...data, ...value }), {})
};
