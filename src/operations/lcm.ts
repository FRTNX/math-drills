export {};

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
    time_penalty: number,
    display_type: string
}

const DIFFICULTY_PROFILES = {
    0: {
        primes: [2, 3, 5],
        numberOfTerms: [2, 4],
        numberOfPrimes: [2, 4],
        timeLimit: 60000,
        baseAward: [5, 6],
        timeAward: 1,
        timePenalty: 2,
        displayType: 'inline',
        tooltipIntro: `The best of primes.`
    },
    1: {
        primes: [2, 3, 5, 7],
        numberOfTerms: [2, 4],
        numberOfPrimes: [2, 5],
        timeLimit: 60000,
        baseAward: [5, 8],
        timeAward: 1,
        timePenalty: 2,
        displayType: 'inline'
    }
};

const lcm = async (operation : string, difficulty : number) : Promise<IQuestion> => {
    const difficultyProfile = DIFFICULTY_PROFILES[difficulty];

    const numberOfTerms : number = random(...difficultyProfile.numberOfTerms);

    const terms : Array<number> = []; // terms to display
    const primes : Array<Array<number>> = []; // the prime factors that form the selected terms

    // can't see the point of a test so evil it uses more then ~5 terms.
    // i mean why. i mean you could, but why. anyway, the low ceiling means these
    // for loops are always finite enough to be quick.
    for (let i = 0; i < numberOfTerms; i++) {
        const numberOfPrimes : number = random(...difficultyProfile.numberOfPrimes);
        const primeIndices : Array<number> = [];

        for (let i = 0; i < numberOfPrimes; i++) {
            const primeIndex : number = random(0, difficultyProfile.primes.length);
            primeIndices.push(primeIndex);
        };

        const selectedPrimes = primeIndices.map((index) => difficultyProfile.primes[index]);
        primes.push(selectedPrimes);

        const product : number = selectedPrimes.reduce((prod, partProd) => prod * partProd, 1);
        terms.push(product);
    }

    const primeArrayDetails = {};

    for (let i = 0; i < primes.length; i ++) {
        primeArrayDetails[i] = {};
        for (const prime of primes[i]) {
            if (primeArrayDetails[i][prime]) {
                primeArrayDetails[i][prime] += 1
            } else {
                primeArrayDetails[i][prime] = 1
            }
        }
    };

    const primeCount = {}

    Object.keys(primeArrayDetails).map((arrayIndex) => {
        Object.keys(primeArrayDetails[arrayIndex]).map((prime) => {
            // if we havent recorded the occurances of this prime
            // for other arrays of prime numbers do so now
            if (!primeCount[prime]) {
                primeCount[prime] = primeArrayDetails[arrayIndex][prime]
            };

            // if we have recorded the occurance of this prime for
            // other arrays of primes and this occurance is larger
            // replace previous recorded occurance with current
            if (primeCount[prime] && primeCount[prime] < primeArrayDetails[arrayIndex][prime]) {
                primeCount[prime] = primeArrayDetails[arrayIndex][prime]
            }
        })
    })

    const factors = Object.keys(primeCount).map((prime) => Number(prime) ** primeCount[prime]);

    const product : number = factors.reduce((prod, partProd) => prod * partProd, 1);

    const questionLatex : string = terms.join(', ');

    const question = new Question({
        author: 'DrillBot',
        question_type: operation,
        question_difficulty: Number(difficulty),
        question_latex: questionLatex,
        correct_answer: product,
        time_limit: difficultyProfile.timeLimit,
        base_award: random(...difficultyProfile.baseAward),
        time_award: difficultyProfile.timeAward,
        time_penalty: difficultyProfile.timePenalty,
        display_type: difficultyProfile.displayType
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

    const message : string = `${difficultyProfile.tooltipIntro || ''} ` +
        `Find the lowest common multiple of these numbers. ` +
        `Bonus award time limit: ${difficultyProfile.timeLimit / 1000} seconds.`

    return { [difficulty]: message };
});

module.exports = {
    exec: lcm,
    levels: Object.keys(DIFFICULTY_PROFILES).map((level) => Number(level)),
    tooltips: tooltips.reduce((data, value) => ({ ...data, ...value }), {})
};
