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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
var Question = require('../models/question.model');
var random = require('../helpers/random');
var DIFFICULTY_PROFILES = {
    0: {
        range: [3, 60],
        numberOfTerms: 2,
        timeLimit: 7000,
        baseAward: [4, 6],
        timeAward: 2,
        timePenalty: 1
    },
    1: {
        range: [-50, 100],
        numberOfTerms: 2,
        timeLimit: 7000,
        baseAward: [5, 8],
        timeAward: 2,
        timePenalty: 1
    }
};
var subtraction = function (operation, difficulty) { return __awaiter(void 0, void 0, void 0, function () {
    var difficultyProfile, selectedTerms, numberOfTerms, i, term, difference, formattedTerms, questionLatex, question, existingQuestion, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                difficultyProfile = DIFFICULTY_PROFILES[difficulty];
                selectedTerms = [];
                numberOfTerms = difficultyProfile.numberOfTerms;
                for (i = 0; i < numberOfTerms; i++) {
                    term = random.apply(void 0, __spreadArray([], __read(difficultyProfile.range), false));
                    selectedTerms.push(term);
                }
                difference = selectedTerms.slice(1).reduce(function (diff, value) { return diff - value; }, selectedTerms[0]);
                formattedTerms = selectedTerms.map(function (term) { return term < 0 ? "(" + term + ")" : "" + term; });
                questionLatex = formattedTerms.join(' - ');
                question = new Question({
                    author: 'DrillBot',
                    question_type: operation,
                    question_difficulty: Number(difficulty),
                    question_latex: questionLatex,
                    correct_answer: difference,
                    time_limit: difficultyProfile.timeLimit,
                    base_award: random.apply(void 0, __spreadArray([], __read(difficultyProfile.baseAward), false)),
                    time_award: difficultyProfile.timeAward,
                    time_penalty: difficultyProfile.timePenalty
                });
                return [4 /*yield*/, Question.findOne({
                        question_type: operation,
                        question_difficulty: difficulty,
                        question_latex: questionLatex
                    })];
            case 1:
                existingQuestion = _a.sent();
                if (existingQuestion) {
                    return [2 /*return*/, existingQuestion];
                }
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, question.save()];
            case 3:
                _a.sent();
                return [3 /*break*/, 5];
            case 4:
                error_1 = _a.sent();
                console.log(error_1);
                return [3 /*break*/, 5];
            case 5:
                console.log('Created new question: ', question);
                return [2 /*return*/, question];
        }
    });
}); };
var tooltips = Object.keys(DIFFICULTY_PROFILES).map(function (difficulty) {
    var _a;
    var difficultyProfile = DIFFICULTY_PROFILES[difficulty];
    var message = (difficultyProfile.tooltipIntro || '') + " " +
        "There's no such thing as subtraction... " +
        ("Bonus award time limit: " + difficultyProfile.timeLimit / 1000 + " seconds.");
    return _a = {}, _a[difficulty] = message, _a;
});
module.exports = {
    exec: subtraction,
    levels: Object.keys(DIFFICULTY_PROFILES).map(function (level) { return Number(level); }),
    tooltips: tooltips.reduce(function (data, value) { return (__assign(__assign({}, data), value)); }, {})
};
