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
var User = require('../models/user.model');
var UserAnswer = require('../models/user.answer.model');
var AbortedQuestion = require('../models/aborted.question.model');
var errorHandler = require('./../helpers/db.error.handler');
var fetchRatingProfile = function (userRatings, hasUserAnswers) {
    // if all user answers are randomized answers
    if (!hasUserAnswers) {
        return { name: 'zygote', color: 'default', graphOptions: ['bar2'] };
    }
    if (userRatings[0] < 100) {
        return { name: 'embryo', color: 'embryo', graphOptions: ['bar3'] };
    }
    if (userRatings[0] >= 100 && userRatings[0] < 200) {
        return { name: 'grasshopper', color: 'primary', graphOptions: ['bar3'] };
    }
    if (userRatings[0] >= 200) {
        return { name: 'mantis', color: 'primary', graphOptions: ['bar3'] };
    }
    // todo: add more, adjust conditions, move to separate file (rating.handler.js)
};
var fetchRatingHistory = function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var query, limit, userAnswers, hasUserAnswers, userRating, ratingProfile, result, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                if (!request.query.user_id || !request.query.question_type) {
                    throw new Error('Invalid rating request');
                }
                query = {
                    user_id: request.query.user_id,
                    question_type: request.query.question_type
                };
                limit = request.query.limit
                    ? request.query.limit
                    : 10;
                return [4 /*yield*/, UserAnswer.find(query)
                        .select('rating created')
                        .sort('-created')
                        .limit(limit)
                        .exec()];
            case 1:
                userAnswers = _a.sent();
                return [4 /*yield*/, UserAnswer.exists(__assign(__assign({}, query), { user_answer: { '$ne': 'randomized' } }))];
            case 2:
                hasUserAnswers = _a.sent();
                userRating = userAnswers.map(function (r) { return r.rating; });
                ratingProfile = fetchRatingProfile(userRating, hasUserAnswers);
                result = {
                    ratings: userRating.reverse(),
                    ratingDetails: ratingProfile
                };
                console.log('Returning result: ', result);
                return [2 /*return*/, response.status(200).json(result)];
            case 3:
                error_1 = _a.sent();
                console.log(error_1);
                return [2 /*return*/, response.status(400).json({
                        error: errorHandler.getErrorMessage(error_1)
                    })];
            case 4: return [2 /*return*/];
        }
    });
}); };
var fetchUserStats = function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var userId_1, user, totalAnsweredQuestions, questionTypes, userAnswerDetails, bestOp_1, growthValues, averageGrowth, masteredOps, result, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                userId_1 = request.query.user_id;
                return [4 /*yield*/, User.findOne({ _id: userId_1 }).select('name')];
            case 1:
                user = _a.sent();
                return [4 /*yield*/, UserAnswer.count({ user_id: userId_1 })];
            case 2:
                totalAnsweredQuestions = _a.sent();
                return [4 /*yield*/, UserAnswer.find({ user_id: userId_1 })
                        .distinct('question_type')];
            case 3:
                questionTypes = _a.sent();
                return [4 /*yield*/, Promise.all(questionTypes.map(function (questionType) { return __awaiter(void 0, void 0, void 0, function () {
                        var answerRatings, ratingValues, isMastered, growth, highestRating, lowestRating;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, UserAnswer.find({ user_id: userId_1, question_type: questionType }).select('rating').sort('-created')];
                                case 1:
                                    answerRatings = _a.sent();
                                    ratingValues = answerRatings.map(function (answerRating) { return answerRating.rating; });
                                    isMastered = ratingValues[ratingValues.length - 1] > 200;
                                    growth = ratingValues.length > 1
                                        ? calculateGrowth.apply(void 0, ratingValues.reverse().slice(ratingValues.length - 2)) : 0;
                                    highestRating = Math.max.apply(Math, ratingValues);
                                    lowestRating = Math.min.apply(Math, ratingValues);
                                    return [2 /*return*/, { questionType: questionType, ratingValues: ratingValues, growth: growth, highestRating: highestRating, lowestRating: lowestRating, isMastered: isMastered }];
                            }
                        });
                    }); }))];
            case 4:
                userAnswerDetails = _a.sent();
                bestOp_1 = { questionType: '', highestRating: '' };
                userAnswerDetails.map(function (answerDetails) {
                    var questionType = answerDetails.questionType, highestRating = answerDetails.highestRating;
                    if (!bestOp_1.questionType) {
                        bestOp_1 = { questionType: questionType, highestRating: highestRating };
                    }
                    if (bestOp_1 && bestOp_1.highestRating < highestRating) {
                        bestOp_1 = { questionType: questionType, highestRating: highestRating };
                    }
                });
                growthValues = userAnswerDetails.map(function (answerDetails) { return answerDetails.growth; });
                averageGrowth = 'N/A';
                if (growthValues.length == 1) {
                    averageGrowth = growthValues[0] + "%";
                }
                if (growthValues.length > 1) {
                    averageGrowth = Number(growthValues.reduce(function (partSum, value) { return partSum + value; }, 0) / growthValues.length).toFixed(1) + "%";
                }
                masteredOps = userAnswerDetails.reduce(function (partCount, details) {
                    return details.isMastered
                        ? partCount + 1
                        : partCount;
                }, 0);
                result = {
                    name: user.name,
                    totalAnsweredQuestions: totalAnsweredQuestions,
                    bestOp: bestOp_1.questionType || 'N/A',
                    avgGrowth: averageGrowth,
                    masteredOps: masteredOps
                };
                return [2 /*return*/, response.status(200).json(result)];
            case 5:
                error_2 = _a.sent();
                console.log(error_2);
                return [2 /*return*/, response.status(400).json({
                        error: errorHandler.getErrorMessage(error_2)
                    })];
            case 6: return [2 /*return*/];
        }
    });
}); };
var fetchOpGraphData = function (userId, questionType) { return __awaiter(void 0, void 0, void 0, function () {
    var query, questionRatings, hasUserAnswers, ratingValues, ratingProfile;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                query = {
                    user_id: userId,
                    question_type: questionType
                };
                return [4 /*yield*/, UserAnswer.find(query)
                        .select('rating created')
                        .sort('-created')
                        .limit(11)
                        .exec()];
            case 1:
                questionRatings = _a.sent();
                return [4 /*yield*/, UserAnswer.exists(__assign(__assign({}, query), { user_answer: { '$ne': 'randomized' } }))];
            case 2:
                hasUserAnswers = _a.sent();
                console.log('has user submitted answers: ', hasUserAnswers);
                ratingValues = questionRatings.map(function (r) { return r.rating; }).reverse();
                ratingProfile = fetchRatingProfile(ratingValues, hasUserAnswers);
                // console.log('Got rating profile: ', ratingProfile)
                return [2 /*return*/, {
                        operation: questionType,
                        currentRating: ratingValues[ratingValues.length - 1],
                        values: ratingValues,
                        labels: ratingValues.map(function (value, index) { return index + 1; }),
                        pointRadius: 3,
                        fill: true,
                        badgeColor: ratingProfile.color == 'default' ? 'embryo' : ratingProfile.color,
                        graphOptions: ratingProfile.graphOptions
                    }];
        }
    });
}); };
var calculateGrowth = function (valueA, valueB) { return Math.round(((valueB - valueA) / valueA) * 100); };
var formatTime = function (millis) {
    console.log('Got millis: ', millis);
    // ms
    if (millis < 1000) {
        return millis + "ms";
    }
    // s
    if (millis > 1000 && millis < 1000 * 60) {
        var sec = Math.round(millis / 1000);
        var ms = Number(("" + millis % 1000).slice(0, 2));
        if (Number(ms) > 60) {
            sec += 1;
            ms = 60;
        }
        return sec + "." + ms + "s";
    }
    // m
    if (millis > 1000 * 60 && millis < 1000 * 60 * 60) {
        var min = Math.round(millis / (1000 * 60));
        var sec = Number(("" + millis % (1000 * 60)).slice(0, 2));
        if (Number(sec) > 60) {
            min += 1;
            sec -= 60;
        }
        return min + "m " + sec + "s";
    }
    // h
    // d
    // y
};
var longestPositiveTrend = function (numArray) { return __awaiter(void 0, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        result = { streak: 0, count: 0, prevNum: 0 };
        numArray.map(function (value) {
            if (value > result.prevNum) {
                result.prevNum = value;
                result.count += 1;
                if (result.count > result.streak) {
                    result.streak = result.count;
                }
            }
            if (value < result.prevNum) {
                result.count = 0;
                result.prevNum = value;
            }
        });
        return [2 /*return*/, result.streak];
    });
}); };
var longestNegativeTrend = function (numArray) { return __awaiter(void 0, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        result = { streak: 0, count: 0, prevNum: 0 };
        numArray.map(function (value) {
            if (value < result.prevNum) {
                result.prevNum = value;
                result.count += 1;
                if (result.count > result.streak) {
                    result.streak = result.count;
                }
            }
            if (value > result.prevNum) {
                result.count = 0;
                result.prevNum = value;
            }
        });
        return [2 /*return*/, result.streak];
    });
}); };
var fetchSpeedStats = function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var query, timePerQuestion, speedValues, averageSpeed, result, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                query = {
                    user_id: request.query.user_id,
                    question_type: request.query.op
                };
                return [4 /*yield*/, UserAnswer.find(query)
                        .select('time_taken')
                        .sort('-created')
                        .exec()];
            case 1:
                timePerQuestion = _a.sent();
                speedValues = timePerQuestion.map(function (question) { return question.time_taken; }).reverse();
                averageSpeed = speedValues.reduce(function (partSum, value) { return partSum + Number(value); }, 0) / speedValues.length;
                console.log('average speed: ', averageSpeed);
                result = {
                    operation: request.query.op,
                    currentRating: formatTime(averageSpeed),
                    values: speedValues.map(function (value) { return Number(value / 1000).toFixed(2); }),
                    labels: speedValues.map(function (value, index) { return index + 1; }),
                    pointRadius: 0,
                    fill: true,
                    badgeColor: 'primary',
                    graphOptions: ['line2']
                };
                console.log(result);
                return [2 /*return*/, response.status(200).json(result)];
            case 2:
                error_3 = _a.sent();
                console.log(error_3);
                return [2 /*return*/, response.status(400).json({
                        error: errorHandler.getErrorMessage(error_3)
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
var fetchOpStats = function (userId, questionType) { return __awaiter(void 0, void 0, void 0, function () {
    var params, _a, totalCorrectAnswers, totalIncorrectAnswers, answerDetails, abortedQuestions, graphData, ratingValues, totalTimeSpent, growth, highestRating, lowestRating, _b, correctAnswerStreak, wrongAnswerStreak;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                params = { user_id: userId, question_type: questionType };
                return [4 /*yield*/, Promise.all([
                        UserAnswer.count(__assign(__assign({}, params), { is_correct: true })),
                        UserAnswer.count(__assign(__assign({}, params), { is_correct: false })),
                        UserAnswer.find(__assign({}, params)).select('rating time_taken').sort('-created'),
                        AbortedQuestion.count(__assign({}, params)),
                        fetchOpGraphData(userId, questionType)
                    ])];
            case 1:
                _a = _c.sent(), totalCorrectAnswers = _a[0], totalIncorrectAnswers = _a[1], answerDetails = _a[2], abortedQuestions = _a[3], graphData = _a[4];
                ratingValues = answerDetails.map(function (details) { return details.rating; });
                totalTimeSpent = answerDetails.reduce(function (time, details) { return time + Number(details.time_taken); }, 0);
                growth = ratingValues.length > 1
                    ? calculateGrowth.apply(void 0, ratingValues.reverse().slice(ratingValues.length - 2)) + "%"
                    : 'N/A';
                highestRating = Math.max.apply(Math, ratingValues);
                lowestRating = Math.min.apply(Math, ratingValues);
                return [4 /*yield*/, Promise.all([
                        longestPositiveTrend(ratingValues),
                        longestNegativeTrend(ratingValues)
                    ])];
            case 2:
                _b = _c.sent(), correctAnswerStreak = _b[0], wrongAnswerStreak = _b[1];
                return [2 /*return*/, {
                        questionType: questionType,
                        totalCorrectAnswers: totalCorrectAnswers,
                        totalIncorrectAnswers: totalIncorrectAnswers,
                        totalAnsweredQuestions: totalCorrectAnswers + totalIncorrectAnswers,
                        abortedQuestions: abortedQuestions,
                        highestRating: highestRating,
                        lowestRating: lowestRating,
                        graphData: graphData,
                        growth: growth,
                        correctAnswerStreak: correctAnswerStreak,
                        wrongAnswerStreak: wrongAnswerStreak,
                        totalTimeSpent: formatTime(totalTimeSpent)
                    }];
        }
    });
}); };
var compileStats = function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var userId_2, op, selectedTypes, answeredQuestionTypes, stats, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                userId_2 = request.query.user_id;
                op = request.query.op;
                selectedTypes = [];
                if (!op) return [3 /*break*/, 1];
                selectedTypes.push(op);
                return [3 /*break*/, 3];
            case 1: return [4 /*yield*/, UserAnswer.find({ user_id: userId_2 })
                    .distinct('question_type')];
            case 2:
                answeredQuestionTypes = _a.sent();
                selectedTypes.push.apply(selectedTypes, answeredQuestionTypes.slice(0, 2));
                _a.label = 3;
            case 3: return [4 /*yield*/, Promise.all(selectedTypes.map(function (questionType) { return fetchOpStats(userId_2, questionType); }))];
            case 4:
                stats = _a.sent();
                console.log('Got stats: ', stats);
                return [2 /*return*/, response.status(200).json(stats)];
            case 5:
                error_4 = _a.sent();
                console.log(error_4);
                return [2 /*return*/, response.status(400).json({
                        error: errorHandler.getErrorMessage(error_4)
                    })];
            case 6: return [2 /*return*/];
        }
    });
}); };
var fetchActiveOps = function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, UserAnswer.find({ user_id: request.query.user_id })
                        .distinct('question_type')];
            case 1:
                result = _a.sent();
                console.log('returning active ops: ', result);
                return [2 /*return*/, response.status(200).json(result)];
            case 2:
                error_5 = _a.sent();
                console.log(error_5);
                return [2 /*return*/, response.status(400).json({
                        error: errorHandler.getErrorMessage(error_5)
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
module.exports = {
    fetchRatingHistory: fetchRatingHistory,
    fetchUserStats: fetchUserStats,
    compileStats: compileStats,
    fetchActiveOps: fetchActiveOps,
    fetchSpeedStats: fetchSpeedStats
};
