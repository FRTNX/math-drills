"use strict";
exports.__esModule = true;
var mongoose = require('mongoose');
// import { IQuestion } from './model.types';
var QuestionSchema = new mongoose.Schema({
    title: String,
    author: {
        type: String,
        required: 'Author is required'
    },
    description: String,
    question_type: {
        type: String,
        required: 'Question type is required'
    },
    question_syllabus: String,
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
        type: Number
    },
    time_award: {
        type: Number
    },
    time_penalty: {
        type: Number
    },
    display_type: String,
    notes: String,
    created: {
        type: Date,
        "default": Date.now
    },
    updated: Date
});
module.exports = mongoose.model('Question', QuestionSchema);
