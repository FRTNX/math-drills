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
        baseAward: [4, 6],
        timeAward: 1,
        timePenalty: 2,
        displayType: 'inline',
        tooltipIntro: `Common primes of olden times.`
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

const hcf = async (operation : string, difficulty : number) : Promise<IQuestion> => {
    const difficultyProfile = DIFFICULTY_PROFILES[difficulty];

    const numberOfTerms : number = random(...difficultyProfile.numberOfTerms);

    const terms : Array<number> = [];
    const primes : Array<Array<number>> = [];

    // at the end of this for loop, where, for example, terms = [8, 15, 50] the 
    // primes array would then be [[2, 2, 2], [3, 5], [2, 5, 5]]
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

    // get details about each array of primes in primes array. 
    // where primes array = [[2, 2, 2], [3, 5], [2, 5, 5]]
    // primeArrayDetails would then look like {{ 2: 3 }, { 3: 1, 5: 1 }, { 2: 1, 5: 2 }}
    // after running the below for loop
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

    const commonFactors = {};

    const checkOccurances = (array, element) => {
        let counter = 0;
        for (const item of array.flat()) {
            if (item == element) {
                counter ++;
            }
        }
    
        return counter;
    };

    // this checks for the occurance of a prime factor across
    // all prime arrays in primes
    Object.keys(primeArrayDetails).map((arrayIndex) => {
        Object.keys(primeArrayDetails[arrayIndex]).map((prime) => {
            const currentOccurance : number = primeArrayDetails[arrayIndex][prime];
            if (primes.every((primeArray) => checkOccurances(primeArray, prime) >= currentOccurance)) {
                commonFactors[prime] = currentOccurance;
            }
        })
    });

    let product : number = 1; // default where no other common factors are found

    if (Object.keys(commonFactors).length > 0) {
        const factors = Object.keys(commonFactors).map((prime) => Number(prime) ** commonFactors[prime]);
        product = factors.reduce((prod, partProd) => prod * partProd, 1);
    }

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
        `Find the highest common factor of these numbers. ` +
        `Bonus award time limit: ${difficultyProfile.timeLimit / 1000} seconds.`

    return { [difficulty]: message };
});

module.exports = {
    exec: hcf,
    levels: Object.keys(DIFFICULTY_PROFILES).map((level) => Number(level)),
    tooltips: tooltips.reduce((data, value) => ({ ...data, ...value }), {})
};
