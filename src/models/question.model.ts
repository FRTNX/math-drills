export { };

const mongoose = require('mongoose');

type QuestionType = 'addition' | 'subtraction' | 'multiplication' | 'division' |
    'fractions' | 'decimals' | 'prime_factorization' | 'lcm' | 'hcf' |
    'exponents' | 'scientific_notation' | 'radicals' | 'summation' | 'percentage' |
    'logarithms';

interface IQuestion {
    title?: string,
    author: string,
    description?: string,
    question_type: QuestionType
    question_syllabus?: string,
    question_difficulty: number,
    question_text?: string,
    question_latex: string,
    correct_answer: string,
    base_award: number,
    time_limit: number,
    time_award: number,
    time_penalty: number,
    display_type?: string,
    notes?: string
}

const QuestionSchema = new mongoose.Schema({
    title: String,
    author: {
        type: String,
        required: 'Author is required'
    },
    description: String,
    question_type: { // TODO: enforce with Typescript
        type: String,
        required: 'Question type is required'
    },
    question_syllabus: String, // e.g. GCE O Level, SAT, etc
    question_difficulty: {
        type: Number,
        required: 'Question difficulty is required'
    },
    question_text: String,
    question_latex: {
        type: String,
        required: 'Question LaTex is required',
        unique: 'This question already exists'
    },
    correct_answer: {
        type: String,
        required: 'Correct answer is required'
    },
    base_award: {
        type: Number,
        required: 'Base award is requird'
    },
    time_limit: {
        type: Number,
        // required: 'Time limit is required'
    },
    time_award: {
        type: Number,
        // required: 'Time award is required'
    },
    time_penalty: {
        type: Number,
        // required: 'Time penalty is required'
    },
    display_type: String, // types: 'block', 'inline'
    notes: String,
    created: {
        type: Date,
        default: Date.now
    },
    updated: Date
});

module.exports = mongoose.model('Question', QuestionSchema);
