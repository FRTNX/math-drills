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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
exports.__esModule = true;
var Question = require('../models/question.model');
var random = require('../helpers/random');
var DIFFICULTY_PROFILES = {
    0: {
        primes: [2, 3, 5],
        numberOfTerms: [2, 4],
        numberOfPrimes: [2, 4],
        timeLimit: 60000,
        baseAward: [5, 6],
        timeAward: 1,
        timePenalty: 2,
        displayType: 'inline',
        tooltipIntro: "The best of primes."
    },
    1: {
        primes: [2, 3, 5, 7],
        numberOfTerms: [2, 4],
        numberOfPrimes: [2, 5],
        timeLimit: 60000,
        baseAward: [5, 8],
        timeAward: 1,
        timePenalty: 2,
        displayType: 'inline'
    }
};
var lcm = function (operation, difficulty) { return __awaiter(void 0, void 0, void 0, function () {
    var difficultyProfile, numberOfTerms, terms, primes, i, numberOfPrimes, primeIndices, i_1, primeIndex, selectedPrimes, product_1, primeArrayDetails, i, _a, _b, prime, primeCount, factors, product, questionLatex, question, existingQuestion, error_1;
    var e_1, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                difficultyProfile = DIFFICULTY_PROFILES[difficulty];
                numberOfTerms = random.apply(void 0, __spreadArray([], __read(difficultyProfile.numberOfTerms), false));
                terms = [];
                primes = [];
                // can't see the point of a test so evil it uses more then ~5 terms.
                // i mean why. i mean you could, but why. anyway, the low ceiling means these
                // for loops are always finite enough to be quick.
                for (i = 0; i < numberOfTerms; i++) {
                    numberOfPrimes = random.apply(void 0, __spreadArray([], __read(difficultyProfile.numberOfPrimes), false));
                    primeIndices = [];
                    for (i_1 = 0; i_1 < numberOfPrimes; i_1++) {
                        primeIndex = random(0, difficultyProfile.primes.length);
                        primeIndices.push(primeIndex);
                    }
                    ;
                    selectedPrimes = primeIndices.map(function (index) { return difficultyProfile.primes[index]; });
                    primes.push(selectedPrimes);
                    product_1 = selectedPrimes.reduce(function (prod, partProd) { return prod * partProd; }, 1);
                    terms.push(product_1);
                }
                primeArrayDetails = {};
                for (i = 0; i < primes.length; i++) {
                    primeArrayDetails[i] = {};
                    try {
                        for (_a = (e_1 = void 0, __values(primes[i])), _b = _a.next(); !_b.done; _b = _a.next()) {
                            prime = _b.value;
                            if (primeArrayDetails[i][prime]) {
                                primeArrayDetails[i][prime] += 1;
                            }
                            else {
                                primeArrayDetails[i][prime] = 1;
                            }
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a["return"])) _c.call(_a);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
                ;
                primeCount = {};
                Object.keys(primeArrayDetails).map(function (arrayIndex) {
                    Object.keys(primeArrayDetails[arrayIndex]).map(function (prime) {
                        // if we havent recorded the occurances of this prime
                        // for other arrays of prime numbers do so now
                        if (!primeCount[prime]) {
                            primeCount[prime] = primeArrayDetails[arrayIndex][prime];
                        }
                        ;
                        // if we have recorded the occurance of this prime for
                        // other arrays of primes and this occurance is larger
                        // replace previous recorded occurance with current
                        if (primeCount[prime] && primeCount[prime] < primeArrayDetails[arrayIndex][prime]) {
                            primeCount[prime] = primeArrayDetails[arrayIndex][prime];
                        }
                    });
                });
                factors = Object.keys(primeCount).map(function (prime) { return Math.pow(Number(prime), primeCount[prime]); });
                product = factors.reduce(function (prod, partProd) { return prod * partProd; }, 1);
                questionLatex = terms.join(', ');
                question = new Question({
                    author: 'DrillBot',
                    question_type: operation,
                    question_difficulty: Number(difficulty),
                    question_latex: questionLatex,
                    correct_answer: product,
                    time_limit: difficultyProfile.timeLimit,
                    base_award: random.apply(void 0, __spreadArray([], __read(difficultyProfile.baseAward), false)),
                    time_award: difficultyProfile.timeAward,
                    time_penalty: difficultyProfile.timePenalty,
                    display_type: difficultyProfile.displayType
                });
                return [4 /*yield*/, Question.findOne({
                        question_type: operation,
                        question_difficulty: difficulty,
                        question_latex: questionLatex
                    })];
            case 1:
                existingQuestion = _d.sent();
                if (existingQuestion) {
                    return [2 /*return*/, existingQuestion];
                }
                _d.label = 2;
            case 2:
                _d.trys.push([2, 4, , 5]);
                return [4 /*yield*/, question.save()];
            case 3:
                _d.sent();
                return [3 /*break*/, 5];
            case 4:
                error_1 = _d.sent();
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
        "Find the lowest common multiple of these numbers. " +
        ("Bonus award time limit: " + difficultyProfile.timeLimit / 1000 + " seconds.");
    return _a = {}, _a[difficulty] = message, _a;
});
module.exports = {
    exec: lcm,
    levels: Object.keys(DIFFICULTY_PROFILES).map(function (level) { return Number(level); }),
    tooltips: tooltips.reduce(function (data, value) { return (__assign(__assign({}, data), value)); }, {})
};
