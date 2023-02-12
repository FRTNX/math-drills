"use strict";
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
var config = require('../../config/config').config;
var User = require('../models/user.model');
var UserAnswer = require('../models/user.answer.model');
var Question = require('../models/question.model');
var random = require('../helpers/random');
var errorHandler = require('./../helpers/db.error.handler');
var formidable = require('formidable');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var extend = require('lodash/extend');
var profileImage = fs.readFileSync('./src/assets/images/p3.jpg');
// Durstenfeld shuffle; todo: change to Fisher-Yates; eventually move to helpers
var shuffle = function (array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    ;
    return array;
};
var populateRandomizedData = function (userId, operation) { return __awaiter(void 0, void 0, void 0, function () {
    var questionTypes, result;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!operation) return [3 /*break*/, 1];
                questionTypes = [operation];
                return [3 /*break*/, 3];
            case 1: return [4 /*yield*/, Question.find({}).distinct('question_type')];
            case 2:
                questionTypes = _b.sent();
                _b.label = 3;
            case 3: return [4 /*yield*/, Promise.all(questionTypes.map(function (questionType) { return __awaiter(void 0, void 0, void 0, function () {
                    var alreadyRandomized, numberOfQuestions, randomizedAnswers, incorrectAnswers, correctAnswers, i, i, currentRating;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, UserAnswer.exists({
                                    user_id: userId,
                                    question_type: questionType,
                                    user_answer: 'randomized'
                                })];
                            case 1:
                                alreadyRandomized = _a.sent();
                                if (alreadyRandomized) {
                                    console.log("Skipped " + questionType + " for user " + userId + ", " +
                                        "randomized data already populated for this op");
                                    return [2 /*return*/];
                                }
                                numberOfQuestions = random(11, 20);
                                randomizedAnswers = [];
                                incorrectAnswers = random(3, 5);
                                correctAnswers = numberOfQuestions - incorrectAnswers;
                                for (i = 0; i < correctAnswers; i++) {
                                    randomizedAnswers.push({ isCorrect: true });
                                }
                                for (i = 0; i < incorrectAnswers; i++) {
                                    randomizedAnswers.push({ isCorrect: false });
                                }
                                currentRating = 0;
                                shuffle(randomizedAnswers).map(function (randomizedAnswer) { return __awaiter(void 0, void 0, void 0, function () {
                                    var question, timeTaken, questionAward, answer;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, Question.findOne({ question_type: questionType, difficulty: 0 })];
                                            case 1:
                                                question = _a.sent();
                                                timeTaken = random(1000, question.time_limit + 1000);
                                                if (randomizedAnswer.isCorrect) {
                                                    questionAward = timeTaken <= question.time_limit
                                                        ? question.base_award
                                                        : question.base_award - question.time_penalty;
                                                    currentRating += questionAward;
                                                }
                                                else {
                                                    currentRating -= question.base_award;
                                                }
                                                answer = UserAnswer({
                                                    user_id: userId,
                                                    question_id: question._id,
                                                    question_type: question.question_type,
                                                    question_difficulty: question.question_difficulty,
                                                    user_answer: 'randomized',
                                                    is_correct: true,
                                                    time_taken: timeTaken,
                                                    rating: currentRating
                                                });
                                                return [4 /*yield*/, answer.save()];
                                            case 2:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                }); });
                                return [2 /*return*/, { message: "Populated randomized data for op: " + questionType }];
                        }
                    });
                }); }))];
            case 4:
                result = _b.sent();
                return [2 /*return*/, (_a = {}, _a[userId] = result.filter(function (r) { return !r === false; }), _a)];
        }
    });
}); };
/**
 * Regular user registration
 * @param request
 * @param response
 * @returns
 */
var create = function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var user, userId, defaultAlias, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                user = new User(request.body);
                if (!request.body.alias) {
                    userId = user._id.toString();
                    defaultAlias = userId.slice(userId.length - 5);
                    user.alias = defaultAlias;
                }
                user.is_anonymous = false;
                return [4 /*yield*/, user.save()];
            case 1:
                _a.sent();
                return [4 /*yield*/, populateRandomizedData(user._id)];
            case 2:
                _a.sent();
                return [2 /*return*/, response.status(200).json({ message: 'SUCCESS' })];
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
// meant to run once to retrofit default aliases to pre-existing users
var retrofitAliases = function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var users, aliaslessUsers, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, User.find({}).select('_id allias')];
            case 1:
                users = _a.sent();
                aliaslessUsers = users.filter(function (user) { return !user.alias; });
                return [4 /*yield*/, Promise.all(aliaslessUsers.map(function (user) { return __awaiter(void 0, void 0, void 0, function () {
                        var userId, defaultAlias;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    userId = user._id.toString();
                                    defaultAlias = userId.slice(userId.length - 5);
                                    return [4 /*yield*/, User.findOneAndUpdate({ _id: user._id }, { alias: defaultAlias })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); }))];
            case 2:
                _a.sent();
                return [2 /*return*/, response.status(200).json({ message: 'SUCCESS' })];
            case 3:
                error_2 = _a.sent();
                console.log(error_2);
                return [2 /*return*/, response.status(400).json({
                        error: errorHandler.getErrorMessage(error_2)
                    })];
            case 4: return [2 /*return*/];
        }
    });
}); };
var anonymousLogin = function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var anonymousUsers, user, userId, defaultAlias, token, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4 /*yield*/, User.count({
                        name: 'Anonymous User',
                        password: 'anonymous1'
                    })];
            case 1:
                anonymousUsers = _a.sent();
                user = new User({
                    name: 'Anonymous User',
                    password: 'anonymous1',
                    email: "user" + (anonymousUsers + 1) + "@anonymous.com",
                    is_anonymous: true
                });
                userId = user._id.toString();
                defaultAlias = userId.slice(userId.length - 5);
                user.alias = defaultAlias;
                console.log('created anonymous user: ', user);
                return [4 /*yield*/, user.save()];
            case 2:
                _a.sent();
                return [4 /*yield*/, populateRandomizedData(user._id)];
            case 3:
                _a.sent();
                token = jwt.sign({ _id: user._id }, config.jwtSecret);
                response.cookie("t", token, { expire: Number(new Date()) + 9999 });
                return [2 /*return*/, response.json({ token: token, user: { _id: user._id, name: user.name, email: user.email } })];
            case 4:
                error_3 = _a.sent();
                console.log(error_3);
                return [2 /*return*/, response.status(400).json({
                        error: errorHandler.getErrorMessage(error_3)
                    })];
            case 5: return [2 /*return*/];
        }
    });
}); };
var populateOps = function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var userIds_1, userId, userExists, users, result, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                userIds_1 = [];
                if (!request.query.user_id) return [3 /*break*/, 2];
                userId = request.query.user_id;
                return [4 /*yield*/, User.exists({ _id: userId })];
            case 1:
                userExists = _a.sent();
                if (!userExists) {
                    return [2 /*return*/, response.status(404).json({ error: 'user not found' })];
                }
                userIds_1.push(request.query.user_id);
                _a.label = 2;
            case 2:
                if (!!request.query.user_id) return [3 /*break*/, 4];
                return [4 /*yield*/, User.find({})
                        .select('_id')
                        .exec()];
            case 3:
                users = _a.sent();
                users.map(function (user) {
                    userIds_1.push(user._id);
                });
                _a.label = 4;
            case 4:
                ;
                console.log("populating ops for " + userIds_1.length + " users");
                return [4 /*yield*/, Promise.all(userIds_1.map(function (userId) { return populateRandomizedData(userId); }))];
            case 5:
                result = _a.sent();
                console.log('result of randomized population: ', result);
                return [2 /*return*/, response.status(200).json(result)];
            case 6:
                error_4 = _a.sent();
                console.log(error_4);
                return [2 /*return*/, response.status(400).json({
                        error: errorHandler.getErrorMessage(error_4)
                    })];
            case 7: return [2 /*return*/];
        }
    });
}); };
var userByID = function (request, response, next, id) { return __awaiter(void 0, void 0, void 0, function () {
    var user, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, User.findById(id).populate('following', '_id name')
                        .populate('followers', '_id name')
                        .exec()];
            case 1:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, response.status('400').json({
                            error: "User not found"
                        })];
                }
                ;
                request.profile = user;
                next();
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                return [2 /*return*/, response.status('400').json({
                        error: "Could not retrieve user"
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
var read = function (request, response) {
    request.profile.hashed_password = undefined;
    request.profile.salt = undefined;
    return response.json(request.profile);
};
var update = function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var form;
    return __generator(this, function (_a) {
        form = new formidable.IncomingForm();
        form.keepExtensions = true;
        form.parse(request, function (error, fields, files) { return __awaiter(void 0, void 0, void 0, function () {
            var user, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (error) {
                            return [2 /*return*/, response.status(400).json({
                                    error: "Photo could not be uploaded"
                                })];
                        }
                        user = request.profile;
                        user = extend(user, fields);
                        user.updated = Date.now();
                        if (files.photo) {
                            user.photo.data = fs.readFileSync(files.photo.path);
                            user.photo.contentType = files.photo.type;
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, user.save()];
                    case 2:
                        _a.sent();
                        user.hashed_password = undefined;
                        user.salt = undefined;
                        return [2 /*return*/, response.json(user)];
                    case 3:
                        error_6 = _a.sent();
                        return [2 /*return*/, response.status(400).json({
                                error: errorHandler.getErrorMessage(error_6)
                            })];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/];
    });
}); };
var photo = function (request, response, next) {
    if (request.profile.photo.data) {
        response.set("Content-Type", request.profile.photo.contentType);
        return response.send(request.profile.photo.data);
    }
    next();
};
var defaultPhoto = function (request, response) {
    return response.sendFile(process.cwd() + profileImage);
};
var userCount = function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var users, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                if (request.query.key !== config.adminKey) {
                    throw new Error('Oh no you dont');
                }
                return [4 /*yield*/, User.find({}).select('name email created')];
            case 1:
                users = _a.sent();
                response.json({ count: users.length, users: users });
                return [3 /*break*/, 3];
            case 2:
                error_7 = _a.sent();
                return [2 /*return*/, response.status(400).json({
                        error: errorHandler.getErrorMessage(error_7)
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
var fetchUserAlias = function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, user, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = request.query.user_id;
                return [4 /*yield*/, User.findOne({ _id: userId }).select('alias')];
            case 1:
                user = _a.sent();
                console.log('found user alias: ', user);
                response.json({ alias: user.alias });
                return [3 /*break*/, 3];
            case 2:
                error_8 = _a.sent();
                return [2 /*return*/, response.status(400).json({
                        error: errorHandler.getErrorMessage(error_8)
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
var debug = function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            response.json({ debug: process.env });
        }
        catch (error) {
            return [2 /*return*/, response.status(400).json({
                    error: errorHandler.getErrorMessage(error)
                })];
        }
        return [2 /*return*/];
    });
}); };
module.exports = {
    create: create,
    userByID: userByID,
    read: read,
    update: update,
    photo: photo,
    defaultPhoto: defaultPhoto,
    userCount: userCount,
    populateOps: populateOps,
    anonymousLogin: anonymousLogin,
    retrofitAliases: retrofitAliases,
    fetchUserAlias: fetchUserAlias,
    debug: debug
};
