export { };

const Question = require('../models/question.model');
const random = require('../helpers/random');

const { generateQuestionLatex } = require('../helpers/evaluations');

import { IQuestion } from './../models/model.types';

// todo: implement grouping

const DIFFICULTY_PROFILES = {
    0: {
        numberOfTerms: [2],
        numberOfFactors: [2, 3, 4],
        literals: ['a', 'b'],
        operators: ['addition', 'subtraction', 'multiplication'],
        timeLimit: 7000,
        baseAward: [5, 7],
        timeAward: 1,
        timePenalty: 2,
        tooltipIntro: 'Monomial City. Exponents should be formatted as x^2 (x squared in this example). '
    }
};

const checkOccurances = (array: Array<any>, element: any) => {
    let counter = 0;
    for (const item of array.flat()) {
        if (item == element) {
            counter++;
        }
    }

    return counter;
};

function uniqueElements(value, index, self) {
    return self.indexOf(value) === index;
};

const monomials = async (operation: string, difficulty: number): Promise<IQuestion> => {
    const difficultyProfile = DIFFICULTY_PROFILES[difficulty];

    const terms: Array<string> = [];
    const formattedTerms: Array<any> = [];

    const numberOfTerms: number = difficultyProfile.numberOfTerms[
        random(0, difficultyProfile.numberOfTerms.length)
    ];

    for (let i = 0; i < numberOfTerms; i++) {
        const numberOfFactors: number = difficultyProfile.numberOfFactors[
            random(0, difficultyProfile.numberOfFactors.length)
        ];

        const factors: Array<string> = [];

        for (let j = 0; j < numberOfFactors; j++) {
            const selectedLiteral: string = difficultyProfile.literals[
                random(0, difficultyProfile.literals.length)
            ];

            let targetIndex: number;

            factors.map((factor, index) => {
                if (factor.includes(selectedLiteral)) {
                    targetIndex = index;
                }
            });

            if (typeof targetIndex === 'number') {
                if (factors[targetIndex].match(/\d+/g)) {
                    let coefficient = factors[targetIndex].match(/\d+/g)[0]
                    factors[targetIndex] = `${Number(coefficient) + 1}${selectedLiteral}`;
                }

                else {
                    factors[targetIndex] = `2${selectedLiteral}`;
                }
            }

            else {
                factors.push(selectedLiteral);
            }
        }

        const coefficients = [];
        const literals = [];

        factors.map((factor) => {
            const coefficient = factor.match(/\d+/g)
            const literalFactors = factor.match(/[^0-9]/g)

            if (coefficient) {
                coefficients.push(Number(coefficient[0]))
            }

            if (literalFactors) {
                literals.push(literalFactors)
            }
        });

        const unifiedCoefficient = coefficients.reduce((partProd, value) => partProd * value, 1)
        const unifiedLiterals = literals.join('').split('').sort().join('');

        const monomial = unifiedCoefficient === 1
            ? `{${unifiedLiterals}}`
            : `{${unifiedCoefficient}}{${unifiedLiterals}}`;

        formattedTerms.push({
            coefficient: unifiedCoefficient,
            literals: unifiedLiterals
        });

        terms.push(monomial);
    }

    let questionLatex: string;
    let correctAnswer: string;

    if (terms.length > 1) {
        const operator: string = difficultyProfile.operators[
            random(0, difficultyProfile.operators.length)
        ];

        const options = { calculate: false };

        const result: [string, number] = generateQuestionLatex(operator, terms, [], options);
        questionLatex = result[0];

        if (operator === 'addition') {
            if (formattedTerms.length === 2) {
                if (formattedTerms[0].literals === formattedTerms[1].literals) {
                    const coefficient = formattedTerms[0].coefficient + formattedTerms[1].coefficient;
                    coefficient === 0
                        ? correctAnswer = '0'
                        : correctAnswer = Math.abs(coefficient) === 1
                            ? `${coefficient < 0 ? '-' : ''}${formattedTerms[0].literals}`
                            : `${coefficient}${formattedTerms[0].literals}`;
                }

                else {
                    correctAnswer = questionLatex.replace(/\s/g, '');
                }
            }
        }

        if (operator === 'subtraction') {
            if (formattedTerms.length === 2) {
                if (formattedTerms[0].literals === formattedTerms[1].literals) {
                    const coefficient = formattedTerms[0].coefficient - formattedTerms[1].coefficient;
                    coefficient === 0
                        ? correctAnswer = '0'
                        : correctAnswer = Math.abs(coefficient) === 1
                            ? `${coefficient < 0 ? '-' : ''}${formattedTerms[0].literals}`
                            : `${coefficient}${formattedTerms[0].literals}`;
                }

                else {
                    correctAnswer = questionLatex.replace(/\s/g, '');
                }
            }
        }

        if (operator === 'multiplication') {
            if (formattedTerms.length === 2) {
                const coefficient = formattedTerms[0].coefficient * formattedTerms[1].coefficient;
                const literalFactors = [];
                formattedTerms.map((term) => {
                    term.literals.split('').map((literal: string) => {
                        literalFactors.push(literal)
                    });
                });

                const uniqueLiterals = literalFactors.filter(uniqueElements).sort();

                const literalPoduct = uniqueLiterals
                    .map((literal) => {
                        const occurances = checkOccurances(literalFactors, literal);
                        return occurances === 1
                            ? `${literal}`
                            : `${literal}^{${occurances}}`;
                    })
                    .join('');

                coefficient === 0
                    ? correctAnswer = '0'
                    : correctAnswer = Math.abs(coefficient) === 1
                        ? `${coefficient < 0 ? '-' : ''}${literalPoduct}`
                        : `${coefficient}${literalPoduct}`;
            }
        }

        // if (operator === 'division') {

        // }
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

    const message: string = `${difficultyProfile.tooltipIntro || ''}` +
        `Bonus award time limit: ${difficultyProfile.timeLimit / 1000} seconds.`

    return { [difficulty]: message };
});

module.exports = {
    exec: monomials,
    levels: Object.keys(DIFFICULTY_PROFILES).map((level) => Number(level)),
    tooltips: tooltips.reduce((data, value) => ({ ...data, ...value }), {})
};
