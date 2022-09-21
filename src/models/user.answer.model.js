"use strict";
exports.__esModule = true;
var mongoose = require('mongoose');
// import { IUserAnswer } from './model.types';
var UserAnswerSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: 'User id is required'
    },
    question_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'Question',
        required: 'Question id is required'
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
        "default": Date.now
    }
});
module.exports = mongoose.model('UserAnswer', UserAnswerSchema);
