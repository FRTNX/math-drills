export { };

const random = require('../helpers/random');

type QuestionType = 'addition' | 'subtraction' | 'multiplication' | 'division' |
    'fractions' | 'decimals' | 'prime_factorization' | 'lcm' | 'hcf' |
    'exponents' | 'scientific_notation' | 'radicals' | 'summation' | 'percentage' |
    'logarithms';

interface IQuestion {
    question_type: QuestionType,
    correct_answer: string
}

interface IUserAnswer {
    user_answer: string
}

interface IOptions {
    division?: {
        styles?: Array<string>
    }
}

interface IEvaluation {
    isCorrect: boolean,
    correctAnswer: string | number
}

// responsible for general and custom evaluations for all question types.
const evaluateAnswer = (question: IQuestion, answer: IUserAnswer) : IEvaluation => {
    if (question.question_type == 'prime_factorization') {
        const userAnswer = answer.user_answer.match(/\d+/g).map((prime) => Number(prime)).sort();
        const formattedCorrectAnswer = JSON.parse(question.correct_answer).join('\\cdot');

        if (JSON.stringify(userAnswer) !== question.correct_answer) {
            return { isCorrect: false, correctAnswer: formattedCorrectAnswer };
        }

        return { isCorrect: true, correctAnswer: formattedCorrectAnswer };
    }

    if (Number(answer.user_answer) !== Number(question.correct_answer)) {
        return { isCorrect: false, correctAnswer: question.correct_answer };
    }

    return { isCorrect: true, correctAnswer: question.correct_answer };
};

/**
 * Returns a 2-element array where the  first element is the question LaTeX
 * and the second element is the question's calculated correct answer.
 * @param {string} operator the operator to be applied to the terms
 * @param {array} terms the integer terms of the operation, for calculation
 * @param {array} formattedTerms optional yet favoured. string representations of the terms array. useful
 * where a questions terms are themselves LaTeX expressions.
 */
const generateQuestionLatex = (operator: string, terms: Array<number>,
    formattedTerms: Array<string> = [], options: IOptions = {}) : [string, number] => {
    let questionLatex: string;
    let correctAnswer: number;

    // ADDITION
    if (operator === 'addition') {
        questionLatex = formattedTerms.length !== 0
            ? formattedTerms.join(' + ')
            : terms.join(' + ');

        console.log('LaTeX: ', questionLatex)
        correctAnswer = terms.reduce((partSum, value) => partSum + value, 0);
    }

    // SUBTRACTION
    if (operator === 'subtraction') {
        questionLatex = formattedTerms.length !== 0
            ? formattedTerms.join(' - ')
            : terms.join(' - ');

        correctAnswer = terms.slice(1).reduce((diff, value) => diff - value, terms[0]);
    }

    // MULTIPLICATION
    if (operator === 'multiplication') {
        correctAnswer = terms.reduce((partProd, value) => partProd * value, 1);

        let styles: Array<string> = ['default', 'dot', 'brackets'];
        const style: string = styles[random(0, styles.length)];

        if (style == 'default') {
            questionLatex = formattedTerms.length !== 0
                ? formattedTerms.join('\\times')
                : terms.join('\\times');
        }

        if (style == 'dot') {
            questionLatex = formattedTerms.length !== 0
                ? formattedTerms.join('\\cdot')
                : terms.join('\\cdot');
        }

        if (style == 'brackets') {
            const factors = formattedTerms.length !== 0
                ? formattedTerms.map((formattedTerm, index) => index === 0
                    ? `${formattedTerm}`
                    : `\\left(${formattedTerm}\\right)`)
                : terms.map((term, index) => index === 0
                    ? `${term}`
                    : `\\left(${term}\\right)`)

            questionLatex = factors.join('');
        }
    }

    // DIVISION
    if (operator === 'division') {
        let styles = options.division
            ? options.division.styles
            : ['default', 'fraction'];

        const style = styles[random(0, styles.length)];

        if (style === 'default') {
            questionLatex = formattedTerms.length !== 0
                ? formattedTerms.join('\\div')
                : terms.join('\\div');
        }

        if (style === 'fraction') {
            questionLatex = formattedTerms.length !== 0
                ? `\\frac{${formattedTerms[0]}}{${formattedTerms[1]}}`
                : `\\frac{${terms[0]}}{${terms[1]}}`;
        }

        correctAnswer = terms.slice(1).reduce((quotient, value) => quotient / value, terms[0]);
    }

    return [questionLatex, correctAnswer];
};

module.exports = {
    evaluateAnswer,
    generateQuestionLatex
};
