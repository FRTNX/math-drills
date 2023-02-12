"use strict";
exports.__esModule = true;
var _a = require('mongoose'), Schema = _a.Schema, model = _a.model;
// import { IAbortedQuestion } from './model.types';
var AbortedQuestionSchema = new Schema({
    user_id: {
        type: Schema.ObjectId,
        ref: 'User',
        required: 'User id is required'
    },
    question_id: {
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
