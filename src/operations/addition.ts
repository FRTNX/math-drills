export { };

const Question = require('../models/question.model');
const random = require('../helpers/random');

import { IQuestion } from './../models/model.types';

const DIFFICULTY_PROFILES = {
    0: {
        range: [3, 60],
        numberOfTerms: 2,
        timeLimit: 7000, // millis,
        baseAward: [4, 6],
        timeAward: 2,
        timePenalty: 2,
        tooltipIntro: "Easy peasy.\n"
    },
    1: {
        range: [-50, 100],
        numberOfTerms: 2,
        timeLimit: 10000,
        baseAward: [5, 8],
        timeAward: 2,
        timePenalty: 2,
        tooltipIntro: "Sign rules.\n"
    }
};

const addition = async (operation: string, difficulty: number): Promise<IQuestion> => {
    const difficultyProfile = DIFFICULTY_PROFILES[difficulty];

    const addends: Array<number> = [];
    const numberOfTerms: number = difficultyProfile.numberOfTerms;

    for (let i = 0; i < numberOfTerms; i++) {
        const addend = random(...difficultyProfile.range);
        addends.push(addend);
    }

    const sum: number = addends.reduce((sum, value) => sum + value, 0);

    // initially had a more readable Array.map thing going on here
    // but Typescript was like nah bro. This simply does a conditional
    // addends.join(' + '), wrapping the addend in brackets where negative.
    const questionLatex: string = addends.slice(1).reduce((latex, value) => 
        latex + ' + ' + (value < 0 ? `(${value})` : value), `${addends[0]}`
    );

    const question = new Question({
        author: 'DrillBot',
        question_type: operation,
        question_difficulty: Number(difficulty),
        question_latex: questionLatex,
        correct_answer: sum,
        time_limit: difficultyProfile.timeLimit,
        base_award: random(...difficultyProfile.baseAward),
        time_award: difficultyProfile.timeAward,
        time_penalty: difficultyProfile.timePenalty
    });

    // if the question just generated already exists return the persisted question.
    // this is to avoid running recursion until a new question is found as each
    // set of parameters has a finite number of possible questions
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
        `Typically ${difficultyProfile.numberOfTerms} terms, ` +
        `ranging from ${difficultyProfile.range[0]} to ${difficultyProfile.range[1]}. ` +
        `Bonus award time limit: ${difficultyProfile.timeLimit / 1000} seconds.`

    return { [difficulty]: message };
});

module.exports = {
    exec: addition,
    levels: Object.keys(DIFFICULTY_PROFILES).map((level) => Number(level)),
    tooltips: tooltips.reduce((data, value) => ({ ...data, ...value }), {})
};
