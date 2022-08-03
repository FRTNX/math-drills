export { };

const mongoose = require('mongoose');

type QuestionType = 'addition' | 'subtraction' | 'multiplication' | 'division' |
    'fractions' | 'decimals' | 'prime_factorization' | 'lcm' | 'hcf' |
    'exponents' | 'scientific_notation' | 'radicals' | 'summation' | 'percentage' |
    'logarithms';

interface IUserAnswer {
    user_id: string,
    author: string,
    question_id: string,
    question_type: QuestionType
    question_category?: string,
    question_difficulty: number,
    user_answer: string,
    is_correct: boolean,
    time_taken: number,
    rating: number
}

const UserAnswerSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: 'User id is required'
    },
    question_id:  {
        type: mongoose.Schema.ObjectId,
        ref: 'Question',
        required: 'Question id is required',
        // unique: 'Question already answered' // if ever needed
    },
    question_type: {
        type: String,
        required: 'Question type is required'
    },
    question_category: String,
    question_difficulty: {
        type: Number,
        required: 'Question difficulty is required'
    },
    user_answer: {
        type: String,
        required: 'User answer is required'
    },
    is_correct: {
        type: Boolean,
        required: 'Answer evaluation is required'
    },
    time_taken: {
        type: String,
        required: 'Time taken is required'
    },
    rating: {
        type: Number,
        required: 'User rating as per operation is required'
    },
    created: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('UserAnswer', UserAnswerSchema);
