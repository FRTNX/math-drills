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
        primes: [2, 3, 5, 7],
        numberOfPrimes: [2, 5],
        timeLimit: 60000,
        baseAward: [4, 6],
        timeAward: 1,
        timePenalty: 2
    },
    1: {
        primes: [2, 3, 5, 7, 11],
        numberOfPrimes: [2, 5],
        timeLimit: 60000,
        baseAward: [5, 8],
        timeAward: 1,
        timePenalty: 2
    },
    2: {
        primes: [2, 3, 5, 7, 11, 13],
        numberOfPrimes: [2, 6],
        timeLimit: 60000,
        baseAward: [5, 8],
        timeAward: 1,
        timePenalty: 2
    }
};

const primeFactorization = async (operation: string, difficulty : number) : Promise<IQuestion> => {
    const difficultyProfile = DIFFICULTY_PROFILES[difficulty];

    const primes: Array<number> = difficultyProfile.primes;
    const primeIndices: Array<number> = [];

    const numberOfPrimes: number = random(...difficultyProfile.numberOfPrimes);
    for (let i = 0; i < numberOfPrimes; i++) {
        const primeIndex: number = random(0, primes.length);
        primeIndices.push(primeIndex);
    };

    const selectedPrimes = primeIndices.map((index) => primes[index]);
    const product: number = selectedPrimes.reduce((prod, partProd) => prod * partProd, 1);

    const questionLatex: string = `${product}`;

    const question = new Question({
        author: 'DrillBot',
        question_type: operation,
        question_difficulty: Number(difficulty),
        question_latex: questionLatex,
        correct_answer: JSON.stringify(selectedPrimes.sort()),
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
        `Express this number as its prime factors. ` +
        `Provide the factors separated by spaces. For example 8 = 2 2 2. ` +
        `Bonus award time limit: ${difficultyProfile.timeLimit / 1000} seconds.`

    return { [difficulty]: message };
});

module.exports = {
    exec: primeFactorization,
    levels: Object.keys(DIFFICULTY_PROFILES).map((level) => Number(level)),
    tooltips: tooltips.reduce((data, value) => ({ ...data, ...value }), {})
};
