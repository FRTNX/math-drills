const Question = require('../models/question.model');
const random = require('../helpers/random');

const DIFFICULTY_PROFILES = {
    0: {
        primes: [2, 3, 5],
        numberOfTerms: [2, 4],
        numberOfPrimes: [2, 4],
        timeLimit: 60000,
        baseAward: 6,
        timeAward: 1,
        timePenalty: 2,
        displayType: 'inline'
    },
    1: {
        primes: [2, 3, 5, 7],
        numberOfTerms: [2, 4],
        numberOfPrimes: [2, 5],
        timeLimit: 60000,
        baseAward: 6,
        timeAward: 1,
        timePenalty: 2,
        displayType: 'inline'
    }
};

const lcm = async (operation, difficulty) => {
    const difficultyProfile = DIFFICULTY_PROFILES[difficulty];

    const numberOfTerms = random(...difficultyProfile.numberOfTerms);

    const terms = []; // terms to display
    const primes = []; // the prime factors that form the selected terms

    // can't see the point of a test so evil it uses more then ~5 terms.
    // i mean why. i mean you could, but why. anyway, the low ceiling means these
    // for loops are always finite enough to be quick.
    for (let i = 0; i < numberOfTerms; i++) {
        const numberOfPrimes = random(...difficultyProfile.numberOfPrimes);
        const primeIndices = [];

        for (let i = 0; i < numberOfPrimes; i++) {
            const primeIndex = random(0, difficultyProfile.primes.length);
            primeIndices.push(primeIndex);
        };

        const selectedPrimes = primeIndices.map((index) => difficultyProfile.primes[index]);
        primes.push(selectedPrimes);

        const product = selectedPrimes.reduce((prod, partProd) => prod * partProd, 1);
        terms.push(product);
    }

    console.log('Generated terms: ', terms)
    console.log('And their primes: ', primes)

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

    console.log('prime count: ', primeCount)

    const factors = Object.keys(primeCount).map((prime) => Number(prime) ** primeCount[prime]);

    const product = factors.reduce((prod, partProd) => prod * partProd, 1);

    const questionLatex = terms.join(', ');

    const question = new Question({
        author: 'DrillBot',
        question_type: operation,
        question_difficulty: Number(difficulty),
        question_latex: questionLatex,
        correct_answer: product,
        time_limit: difficultyProfile.timeLimit,
        base_award: difficultyProfile.baseAward,
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

module.exports = {
    exec: lcm,
    levels: Object.keys(DIFFICULTY_PROFILES).map((level) => Number(level))
};
