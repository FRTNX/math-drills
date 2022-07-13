const mongoose = require('mongoose');

const AbortedQuestionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: 'User id is required'
    },
    question_id:  {
        type: mongoose.Schema.ObjectId,
        ref: 'Question',
        required: 'Question id is required',
        unique: 'Entry already exists'
    },
    question_type: {
        type: String,
        required: 'Question type is required'
    }
});

module.exports = mongoose.model('AbortedQuestion', AbortedQuestionSchema);
