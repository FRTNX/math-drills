"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var UserAnswer = require('../models/user.answer.model');
var Question = require('../models/question.model');
var AbortedQuestion = require('../models/aborted.question.model');
var errorHandler = require('./../helpers/db.error.handler');
var evaluations = require('./../helpers/evaluations');
var saveUserAnswer = function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var question, answer, params, lastRelatedAnswer, timeTaken, currentRating, baseAward, userAnswer, result, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                console.log('Got user answer: ', request.body);
                return [4 /*yield*/, Question.findOne({ _id: request.body.question_id })];
            case 1:
                question = _a.sent();
                answer = evaluations.evaluateAnswer(question, request.body);
                params = {
                    user_id: request.body.user_id,
                    question_type: request.body.question_type
                };
                return [4 /*yield*/, UserAnswer.find(params)
                        .select('rating')
                        .sort('-created')
                        .limit(1)
                        .exec()];
            case 2:
                lastRelatedAnswer = _a.sent();
                timeTaken = request.body.time_taken;
                currentRating = 0;
                lastRelatedAnswer.length > 0
                    ? currentRating = lastRelatedAnswer[0].rating
                    : '';
                if (!answer.isCorrect) {
                    currentRating -= question.base_award;
                }
                else {
                    baseAward = question.base_award;
                    timeTaken <= question.time_limit
                        ? baseAward += question.time_award // todo: tighten time award threshold
                        : baseAward -= question.time_penalty;
                    console.log('Rating awarded: ', baseAward);
                    currentRating += baseAward;
                }
                userAnswer = new UserAnswer(__assign(__assign({}, request.body), { is_correct: answer.isCorrect, rating: currentRating }));
                console.log('Created user answer', userAnswer);
                return [4 /*yield*/, userAnswer.save()];
            case 3:
                _a.sent();
                result = {
                    currentRating: currentRating,
                    isCorrect: answer.isCorrect,
                    correctAnswer: answer.correctAnswer
                };
                return [2 /*return*/, response.status(200).json(result)];
            case 4:
                error_1 = _a.sent();
                console.log(error_1);
                return [2 /*return*/, response.status(400).json({
                        error: errorHandler.getErrorMessage(error_1)
                    })];
            case 5: return [2 /*return*/];
        }
    });
}); };
var abortQuestion = function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, questionId, question, abortedQuestion, error_2, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                userId = request.query.user_id;
                questionId = request.query.question_id;
                return [4 /*yield*/, Question.findOne({ _id: questionId })];
            case 1:
                question = _a.sent();
                if (!question) {
                    throw new Error('Question not found');
                }
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                abortedQuestion = new AbortedQuestion({
                    user_id: userId,
                    question_id: question._id,
                    question_type: question.question_type
                });
                return [4 /*yield*/, abortedQuestion.save()];
            case 3:
                _a.sent();
                return [3 /*break*/, 5];
            case 4:
                error_2 = _a.sent();
                console.log(error_2);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/, response.status(200).json({ result: 'SUCCESS' })];
            case 6:
                error_3 = _a.sent();
                console.log(error_3);
                return [2 /*return*/, response.status(400).json({
                        error: errorHandler.getErrorMessage(error_3)
                    })];
            case 7: return [2 /*return*/];
        }
    });
}); };
var fetchUserAnswers = function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var query, userAnswers, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                query = { user_id: request.query.user_id, question_type: '' };
                request.query.question_type
                    ? query.question_type = request.query.question_type
                    : '';
                return [4 /*yield*/, UserAnswer.find(query)];
            case 1:
                userAnswers = _a.sent();
                return [2 /*return*/, response.status(200).json(userAnswers)];
            case 2:
                error_4 = _a.sent();
                console.log(error_4);
                return [2 /*return*/, response.status(400).json({
                        error: errorHandler.getErrorMessage(error_4)
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
module.exports = {
    saveUserAnswer: saveUserAnswer,
    fetchUserAnswers: fetchUserAnswers,
    abortQuestion: abortQuestion
};
