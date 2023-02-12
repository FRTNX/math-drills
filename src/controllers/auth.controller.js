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
var config = require('./../../config/config').config;
var User = require('../models/user.model');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var signin = function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var user, token, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, User.findOne({ "email": request.body.email })];
            case 1:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, response.status('401').json({ error: "User not found" })];
                }
                if (!user.authenticate(request.body.password)) {
                    return [2 /*return*/, response.status('401').send({
                            error: "Email and password don't match."
                        })];
                }
                token = jwt.sign({ _id: user._id }, config.jwtSecret);
                response.cookie("t", token, { expire: Number(new Date()) + 9999 });
                return [2 /*return*/, response.json({ token: token, user: { _id: user._id, name: user.name, email: user.email } })];
            case 2:
                err_1 = _a.sent();
                console.log(err_1);
                return [2 /*return*/, response.status('401').json({ error: "Could not sign in" })];
            case 3: return [2 /*return*/];
        }
    });
}); };
var signout = function (request, response) {
    response.clearCookie("t");
    return response.status('200').json({
        message: "signed out"
    });
};
var requireSignin = expressJwt({
    secret: config.jwtSecret,
    userProperty: 'auth'
});
var hasAuthorization = function (request, response, next) {
    var authorized = request.profile && request.auth && request.profile._id == request.auth._id;
    if (!(authorized)) {
        return response.status('403').json({
            error: "User is not authorized"
        });
    }
    ;
    next();
};
module.exports = {
    signin: signin,
    signout: signout,
    requireSignin: requireSignin,
    hasAuthorization: hasAuthorization
};
