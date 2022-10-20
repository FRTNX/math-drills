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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
exports.__esModule = true;
var Question = require('../models/question.model');
var UserAnswer = require('../models/user.answer.model');
var errorHandler = require('./../helpers/db.error.handler');
var config = require('./../../config/config').config;
var addition = require('../operations/addition');
var subtraction = require('../operations/subtraction');
var multiplication = require('../operations/multiplication');
var division = require('../operations/division');
var logarithm = require('../operations/logarithm');
var primeFactorization = require('../operations/prime.factorization');
var lcm = require('../operations/lcm');
var hcf = require('../operations/hcf');
var fractions = require('../operations/fractions');
var decimals = require('../operations/decimals');
var percentage = require('../operations/percentage');
var scientificNotation = require('../operations/scientific.notation');
var exponents = require('../operations/exponents');
var radicals = require('../operations/radicals');
var summation = require('../operations/summation');
var monomials = require('../operations/monomials');
var got = require('got');
var removeSecrets = function (question) {
    question.correct_answer = undefined;
    question.base_award = undefined;
    question.time_award = undefined;
    question.time_penalty = undefined;
    question.created = undefined;
    question.__v = undefined; // mongoose generated
    return question;
};
var checkForExistingQuestion = function (operation, difficulty) { return __awaiter(void 0, void 0, void 0, function () {
    var userAnswers, answeredQuestionIds, existingQuestion, isAlreadyAnswered;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, UserAnswer.find({
                    question_type: operation,
                    question_difficulty: difficulty
                }).select('question_id')];
            case 1:
                userAnswers = _a.sent();
                answeredQuestionIds = userAnswers.map(function (answer) { return answer.question_id.toString(); });
                return [4 /*yield*/, Question.findOne({
                        question_type: operation,
                        question_difficulty: Number(difficulty)
                    })];
            case 2:
                existingQuestion = _a.sent();
                if (!existingQuestion) {
                    return [2 /*return*/, false];
                }
                isAlreadyAnswered = answeredQuestionIds.includes(existingQuestion._id.toString());
                if (isAlreadyAnswered) {
                    return [2 /*return*/, false];
                }
                return [2 /*return*/, existingQuestion];
        }
    });
}); };
var OPERATIONS_MAP = {
    addition: addition,
    subtraction: subtraction,
    multiplication: multiplication,
    division: division,
    fractions: fractions,
    decimals: decimals,
    prime_factorization: primeFactorization,
    lcm: lcm,
    hcf: hcf,
    exponents: exponents,
    scientific_notation: scientificNotation,
    radicals: radicals,
    summation: summation,
    percentage: percentage,
    logarithms: logarithm,
    monomials: monomials
};
// if there's no question in the db matching requested criterea
// or all such questions have already been answered by the user,
// let Drill Bot generate a new question, persist it, then send it
// to the user
var fetchQuestion = function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var operation, difficulty, question, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                // auxiliary: ping drillbot
                got(config.drillBotServer + "?text=ping&&sessionId=1");
                operation = request.query.op;
                difficulty = request.query.difficulty;
                return [4 /*yield*/, OPERATIONS_MAP[operation].exec(operation, difficulty)];
            case 1:
                question = _a.sent();
                question = removeSecrets(question);
                response.json(question);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.log(error_1);
                return [2 /*return*/, response.status(400).json({
                        error: errorHandler.getErrorMessage(error_1)
                    })];
            case 3: return [2 /*return*/];
        }
    });
}); };
var listOperations = function (request, response) {
    var operationsDetails = Object.keys(OPERATIONS_MAP).reduce(function (operations, operation) {
        var _a;
        return (__assign(__assign({}, operations), (_a = {}, _a[operation] = OPERATIONS_MAP[operation].levels, _a)));
    }, {});
    return response.json(operationsDetails);
};
var fetchTooltipMessage = function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, operation, difficulty, message;
    return __generator(this, function (_b) {
        try {
            _a = __read([
                request.query.op,
                request.query.difficulty
            ], 2), operation = _a[0], difficulty = _a[1];
            message = OPERATIONS_MAP[operation].tooltips[difficulty];
            response.json({ message: message });
        }
        catch (error) {
            console.log(error);
            return [2 /*return*/, response.status(400).json({
                    error: errorHandler.getErrorMessage(error)
                })];
        }
        return [2 /*return*/];
    });
}); };
module.exports = {
    fetchQuestion: fetchQuestion,
    listOperations: listOperations,
    fetchTooltipMessage: fetchTooltipMessage
};
