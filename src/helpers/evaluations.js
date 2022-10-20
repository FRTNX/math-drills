"use strict";
exports.__esModule = true;
var random = require('../helpers/random');
// responsible for general and custom evaluations for all question types.
var evaluateAnswer = function (question, answer) {
    if (question.question_type === 'prime_factorization') {
        var userAnswer = answer.user_answer.match(/\d+/g).map(function (prime) { return Number(prime); }).sort();
        var formattedCorrectAnswer = JSON.parse(question.correct_answer).join('\\cdot');
        if (JSON.stringify(userAnswer) !== question.correct_answer) {
            return { isCorrect: false, correctAnswer: formattedCorrectAnswer };
        }
        return { isCorrect: true, correctAnswer: formattedCorrectAnswer };
    }
    if (question.question_type === 'monomials') {
        var formattedAnswer = question.correct_answer.match(/[^{}]/g).join('');
        var userAnswer = answer.user_answer.replace(/\s/g, '');
        console.log('here');
        if (question.question_latex.replace(/\s/g, '') === question.correct_answer) {
            console.log('IN TARGET');
            if (answer.user_answer === '.') {
                console.log('SECONDARY TARGET');
                return { isCorrect: true, correctAnswer: question.correct_answer };
            }
        }
        if (formattedAnswer === userAnswer) {
            return { isCorrect: true, correctAnswer: question.correct_answer };
        }
        return { isCorrect: false, correctAnswer: question.correct_answer };
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
var generateQuestionLatex = function (operator, terms, formattedTerms, options) {
    if (formattedTerms === void 0) { formattedTerms = []; }
    if (options === void 0) { options = {}; }
    var questionLatex;
    var correctAnswer;
    // ADDITION
    if (operator === 'addition') {
        questionLatex = formattedTerms.length !== 0
            ? formattedTerms.join(' + ')
            : terms.join(' + ');
        var calculate = options.calculate
            ? options.calculate
            : true;
        if (calculate) {
            correctAnswer = terms.reduce(function (partSum, value) { return partSum + value; }, 0);
        }
    }
    // SUBTRACTION
    if (operator === 'subtraction') {
        questionLatex = formattedTerms.length !== 0
            ? formattedTerms.join(' - ')
            : terms.join(' - ');
        var calculate = options.calculate
            ? options.calculate
            : true;
        if (calculate) {
            correctAnswer = terms.slice(1).reduce(function (diff, value) { return diff - value; }, terms[0]);
        }
    }
    // MULTIPLICATION
    if (operator === 'multiplication') {
        var calculate = options.calculate
            ? options.calculate
            : true;
        if (calculate) {
            correctAnswer = terms.reduce(function (partProd, value) { return partProd * value; }, 1);
        }
        var styles = options.multiplication
            ? options.division.styles
            : ['default', 'dot', 'brackets'];
        var style = styles[random(0, styles.length)];
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
            var factors = formattedTerms.length !== 0
                ? formattedTerms.map(function (formattedTerm, index) { return index === 0
                    ? "" + formattedTerm
                    : "\\left(" + formattedTerm + "\\right)"; })
                : terms.map(function (term, index) { return index === 0
                    ? "" + term
                    : "\\left(" + term + "\\right)"; });
            questionLatex = factors.join('');
        }
    }
    // DIVISION
    if (operator === 'division') {
        var styles = options.division
            ? options.division.styles
            : ['default', 'fraction'];
        var style = styles[random(0, styles.length)];
        if (style === 'default') {
            questionLatex = formattedTerms.length !== 0
                ? formattedTerms.join('\\div')
                : terms.join('\\div');
        }
        if (style === 'fraction') {
            questionLatex = formattedTerms.length !== 0
                ? "\\frac{" + formattedTerms[0] + "}{" + formattedTerms[1] + "}"
                : "\\frac{" + terms[0] + "}{" + terms[1] + "}";
        }
        var calculate = options.calculate
            ? options.calculate
            : true;
        if (calculate) {
            correctAnswer = terms.slice(1).reduce(function (quotient, value) { return quotient / value; }, terms[0]);
        }
    }
    return [questionLatex, correctAnswer];
};
module.exports = {
    evaluateAnswer: evaluateAnswer,
    generateQuestionLatex: generateQuestionLatex
};
