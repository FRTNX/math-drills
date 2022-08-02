export {};

const { Schema, model } = require('mongoose');

type QuestionType = 'addition' | 'subtraction' | 'multiplication' | 'division' |
    'fractions' | 'decimals' | 'prime_factorization' | 'lcm' | 'hcf' |
    'exponents' | 'scientific_notation' | 'radicals' | 'summation' | 'percentage' |
    'logarithms';

interface IAbortedQuestion {
    user_id: string,
    question_id: string,
    question_type: QuestionType
}

const AbortedQuestionSchema = new Schema({
    user_id: {
        type: Schema.ObjectId,
        ref: 'User',
        required: 'User id is required'
    },
    question_id:  {
        type: Schema.ObjectId,
        ref: 'Question',
        required: 'Question id is required',
        unique: 'Entry already exists'
    },
    question_type: {
        type: String,
        required: 'Question type is required'
    }
});

module.exports = model('AbortedQuestion', AbortedQuestionSchema);
