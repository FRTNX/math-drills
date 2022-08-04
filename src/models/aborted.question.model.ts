export { };

const { Schema, model } = require('mongoose');

// import { IAbortedQuestion } from './model.types';

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
