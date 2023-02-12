export { };

const Question = require('../models/question.model');
const random = require('../helpers/random');

import { IQuestion } from '../models/model.types';

const DIFFICULTY_PROFILES = {
    0: {
        operators:  ['addition', 'exponent'],
        coefficientRange: [1, 10],
        literalFactors: ['a', 'b', 't', 'x', 'y', 'z'],
        timeLimit: 30000,
        baseAward: [5, 8],
        timeAward: 1,
        timePenalty: 3,
        tooltipIntro: 'Find the missing term. '
    }
};

const trinomialSquares = async (operation: string, difficulty: number): Promise<IQuestion> => {
    const difficultyProfile = DIFFICULTY_PROFILES[difficulty];

    const binomialTerms = [];

    const trinomialTerms = [];

    // select binomial terms
    for (let i = 0; i < 2; i++) {
        const coefficent = random(...difficultyProfile.coefficientRange);
        console.log('selected coefficient:', coefficent)

        const literals = difficultyProfile.literalFactors;

        let selectedLiteral = literals[random(0, literals.length)];

        // to be refactored. the cose below prevents binomials of like terms.
        // eventually use a local poppable array.
        if (binomialTerms.length > 0) {
            const literalExists = binomialTerms.some((termArray) => termArray.some((factor) => selectedLiteral === factor));
            if (literalExists) {
                literals.indexOf(selectedLiteral) < literals.length - 1
                    ? selectedLiteral = literals[literals.indexOf(selectedLiteral) + 1] // sum
                    : selectedLiteral = literals[literals.indexOf(selectedLiteral) - 1] // and diff :)
            }
        }

        console.log('selected literal:', selectedLiteral)

        coefficent === 1
           ? binomialTerms.push([selectedLiteral])
           : binomialTerms.push([coefficent, selectedLiteral]);
    }

    console.log('binomial terms: ', binomialTerms)

    const numeralFactors = []
    const literalFactors = [];

    binomialTerms.map((termArray) => {
        let formattedTrinomialTerm = '';

        termArray.map((factor) => {
            if (typeof factor === 'number') {
                numeralFactors.push(factor);
                formattedTrinomialTerm = `${factor ** 2}`;
            }

            else {
                literalFactors.push(factor)
                formattedTrinomialTerm += `${factor}^2`;
            }
         });

         console.log('got trinomial term: ', formattedTrinomialTerm)
         trinomialTerms.push(formattedTrinomialTerm);
    });

    console.log('numeral factors:', numeralFactors)
    console.log('literal factors: ', literalFactors)

    const product: number =  2 * numeralFactors.reduce((partProd, value) => partProd * value, 1);
    const literalProduct = literalFactors.sort().join('')

    const midTerm = `${product}${literalProduct}`;
    console.log('middle term: ', midTerm)

    trinomialTerms.splice(1, 0, midTerm)

    console.log('trinomial terms: ', trinomialTerms)

    const operators = ['+', '-'];
    
    let questionLatex = `${trinomialTerms[0]} ${operators[random(0, operators.length)]} ` +
        `${trinomialTerms[1]} + ${trinomialTerms[2]}`;

    let correctAnswer = 0;

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
        // await question.save();
    } catch (error) {
        console.log(error);
    }

    // console.log('Created new question: ', question);

    return question;
};

const tooltips = Object.keys(DIFFICULTY_PROFILES).map((difficulty) => {
    const difficultyProfile = DIFFICULTY_PROFILES[difficulty];

    const message: string = `${difficultyProfile.tooltipIntro || ''} ` +
        `Bonus award time limit: ${difficultyProfile.timeLimit / 1000} seconds.`

    return { [difficulty]: message };
});

module.exports = {
    exec: trinomialSquares,
    levels: Object.keys(DIFFICULTY_PROFILES).map((level) => Number(level)),
    tooltips: tooltips.reduce((data, value) => ({ ...data, ...value }), {})
};
