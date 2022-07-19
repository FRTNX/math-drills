const Question = require('../models/question.model');
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
    },
    // 2: {
    //     numberOfTerms: [1, 2],
    //     rootRange: [1, 15],
    //     indices: [2, 3],
    //     ops: ['addition', 'subtraction', 'multiplication', 'division'],
    //     obfuscation: ['none', 'summation'],
    //     timeLimit: 60000,
    //     baseAward: [4, 6],
    //     timeAward: 1,
    //     timePenalty: 2,
    //     tooltipIntro: ''
    // }
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

    if (terms.length > 1) {
        const op = difficultyProfile.ops[random(0, difficultyProfile.ops.length)];

        if (op === 'addition') {
            questionLatex = formattedTerms.join(' + ');
            correctAnswer = terms.reduce((partSum, value) => partSum + value, 0);
        }

        if (op === 'subtraction') {
            questionLatex = formattedTerms.join(' - ');
            correctAnswer = terms.slice(1).reduce((diff, value) => diff - value, terms[0]);
        }

        if (op === 'multiplication') {
            correctAnswer = terms.reduce((partProd, value) => partProd * value, 1);

            let styles = ['default', 'dot', 'brackets'];
            const style = styles[random(0, styles.length)];
    
            if (style == 'default') {
                questionLatex = formattedTerms.join('\\times');
            }
        
            if (style == 'dot') {
                questionLatex = formattedTerms.join('\\cdot');
            }
        
            if (style == 'brackets') {
                factors = formattedTerms.map((term, index) => index === 0
                    ? `${term}`
                    : `\\left(${term}\\right)` );
            
                questionLatex = factors.join('');
            }
        }

        // remove division where numberOfTerms > 2, or transform to complex fraction
        if (op === 'division') {
            questionLatex = `\\frac{${formattedTerms[0]}}{${formattedTerms[1]}}`;
            correctAnswer = terms.slice(1).reduce((quotient, value) => quotient / value, terms[0]);
        }
    }
    
    const question = new Question({
        author: 'DrillBot',
        question_type: operation,
        question_difficulty: Number(difficulty),
        question_latex: questionLatex,
        correct_answer: correctAnswer,
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
