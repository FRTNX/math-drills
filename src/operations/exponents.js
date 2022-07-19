const Question = require('../models/question.model');
const random = require('../helpers/random');

const DIFFICULTY_PROFILES = {
    0: {
        numberOfTerms: [1, 2],
        factorRange: [1, 30],
        exponents: [1, 2], // the first exponent must always be 1
        ops: ['addition', 'subtraction', 'multiplication', 'division'],
        obfuscation: ['none'],
        timeLimit: 7000,
        baseAward: [4, 6],
        timeAward: 1,
        timePenalty: 2,
        tooltipIntro: 'Square up!\n'
    },
    1: {
        numberOfTerms: [1, 2],
        factorRange: [1, 15],
        exponents: [1, 3], // + cubes
        ops: ['addition', 'subtraction', 'multiplication', 'division'],
        obfuscation: ['none'],
        timeLimit: 8000,
        baseAward: [5, 8],
        timeAward: 1,
        timePenalty: 2,
        tooltipIntro: 'Everything cubes.\n'
    },
    2: {
        numberOfTerms: [1, 2],
        factorRange: [1, 30],
        exponents: [1, 2, 3, 10], // all together now
        ops: ['addition', 'subtraction', 'multiplication', 'division'],
        obfuscation: ['none'], // add 'split' where values like 12 ** 3 become (4 * 3) ** 3 
        timeLimit: 15000,
        baseAward: [5, 8],
        timeAward: 1,
        timePenalty: 2,
        tooltipIntro: 'Sqaures, cubes, and powers of 10.\n'
    },
    // 3: {
    //     numberOfTerms: [1, 2],
    //     factorRange: [1, 30],
    //     exponents: [1, 2, 3, 10], // all together now
    //     ops: ['addition', 'subtraction', 'multiplication', 'division'],
    //     obfuscation: ['none', 'radical'],
    //     timeLimit: 60000,
    //     baseAward: [5, 8],
    //     timeAward: 1,
    //     timePenalty: 2,
    //     tooltipIntro: ''
    // }
};

const exponents = async (operation, difficulty) => {
    const difficultyProfile = DIFFICULTY_PROFILES[difficulty];

    const terms = [];
    const formattedTerms = [];

    let hasExponent = false;

    const numberOfTerms = difficultyProfile.numberOfTerms[
        random(0, difficultyProfile.numberOfTerms.length)
    ];

    for (let i = 0; i < numberOfTerms; i ++) {
        const base = random(...difficultyProfile.factorRange);

        let exponent = numberOfTerms > 1
            ? difficultyProfile.exponents[random(0, difficultyProfile.exponents.length)]
            : difficultyProfile.exponents[1]; // this ensures solo exponents always have a power greater than 1
        
        if (exponent !== 1) {
            hasExponent = true;
        }
    
        // if this is the last term and no expnent has been used
        // so far, force the use of an exponent greater than one within difficulty range
        if (i === numberOfTerms - 1 && !hasExponent) {
            exponent = difficultyProfile.exponents[1];
        }

        exponent !== 1
            ? formattedTerms.push(`${base}^{${exponent}}`)
            : formattedTerms.push(`${base}`);

        terms.push(base ** exponent);
    }

    console.log('terms: ', terms)
    console.log('formatted terms:', formattedTerms)

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

        if (op === 'division') {
            questionLatex = formattedTerms.join('\\div');
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
    exec: exponents,
    levels: Object.keys(DIFFICULTY_PROFILES).map((level) => Number(level)),
    tooltips: tooltips.reduce((data, value) => ({ ...data, ...value }), {})
};
