const Question = require('../models/question.model');
const random = require('../helpers/random');

const DIFFICULTY_PROFILES = {
    0: {
        primes: [2, 3, 5, 7],
        numberOfPrimes: [2, 5],
        timeLimit: 60000,
        baseAward: 6,
        timeAward: 1,
        timePenalty: 2
    },
    1: {
        primes: [2, 3, 5, 7, 11],
        numberOfPrimes: [2, 5],
        timeLimit: 60000,
        baseAward: 6,
        timeAward: 1,
        timePenalty: 2
    },
    2: {
        primes: [2, 3, 5, 7, 11, 13],
        numberOfPrimes: [2, 6],
        timeLimit: 60000,
        baseAward: 6,
        timeAward: 1,
        timePenalty: 2
    }
};

const primeFactorization = async (operation, difficulty) => {
    const difficultyProfile = DIFFICULTY_PROFILES[difficulty];

    const primes = difficultyProfile.primes;
    const primeIndices = [];

    const numberOfPrimes = random(...difficultyProfile.numberOfPrimes);
    for (let i = 0; i < numberOfPrimes; i++) {
        const primeIndex = random(0, primes.length);
        primeIndices.push(primeIndex);
    };

    const selectedPrimes = primeIndices.map((index) => primes[index]);
    const product = selectedPrimes.reduce((prod, partProd) => prod * partProd, 1);

    const questionLatex = `${product}`;

    const question = new Question({
        author: 'DrillBot',
        question_type: operation,
        question_difficulty: Number(difficulty),
        question_latex: questionLatex,
        correct_answer: JSON.stringify(selectedPrimes.sort()),
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
    exec: primeFactorization,
    levels: Object.keys(DIFFICULTY_PROFILES).map((level) => Number(level))
};
