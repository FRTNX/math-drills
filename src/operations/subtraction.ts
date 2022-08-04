export { };

const Question = require('../models/question.model');
const random = require('../helpers/random');

import { IQuestion } from './../models/model.types';

const DIFFICULTY_PROFILES = {
    0: {
        range: [3, 60],
        numberOfTerms: 2,
        timeLimit: 7000,
        baseAward: [4, 6],
        timeAward: 2,
        timePenalty: 1
    },
    1: {
        range: [-50, 100],
        numberOfTerms: 2,
        timeLimit: 7000,
        baseAward: [5, 8],
        timeAward: 2,
        timePenalty: 1
    }
};

const subtraction = async (operation: string, difficulty: number): Promise<IQuestion> => {
    const difficultyProfile = DIFFICULTY_PROFILES[difficulty];

    const selectedTerms: Array<number>= [];
    const numberOfTerms: number = difficultyProfile.numberOfTerms;

    for (let i = 0; i < numberOfTerms; i ++) {
        const term: number = random(...difficultyProfile.range);
        selectedTerms.push(term);
    }

    const difference: number = selectedTerms.slice(1).reduce((diff, value) => diff - value, selectedTerms[0]);

    const formattedTerms = selectedTerms.map((term) => term < 0 ? `(${term})` : `${term}`);

    const questionLatex: string = formattedTerms.join(' - ');

    const question = new Question({
        author: 'DrillBot',
        question_type: operation,
        question_difficulty: Number(difficulty),
        question_latex: questionLatex,
        correct_answer: difference,
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
        `There's no such thing as subtraction... ` + 
        `Bonus award time limit: ${difficultyProfile.timeLimit / 1000} seconds.`

    return { [difficulty]: message };
});

module.exports = {
    exec: subtraction,
    levels: Object.keys(DIFFICULTY_PROFILES).map((level) => Number(level)),
    tooltips: tooltips.reduce((data, value) => ({ ...data, ...value }), {})
};
