export { };

const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const { config } = require('./../../config/config');

interface IRequest {
    body: {
        email: string,
        password: string
    },
    profile?: {
        _id: string
    },
    auth?: {
        _id: string
    }
}

interface IResponse {
    status: Function,
    json: Function,
    cookie: Function,
    clearCookie: Function
}

const signin = async (request: IRequest, response: IResponse) : Promise<IResponse> => {
    try {
        let user = await User.findOne({ "email": request.body.email });

        if (!user) {
            return response.status('401').json({ error: "User not found" });
        }

        if (!user.authenticate(request.body.password)) {
            return response.status('401').send({
                error: "Email and password don't match."
            });
        }

        const token = jwt.sign({ _id: user._id }, config.jwtSecret);
        response.cookie("t", token, { expire: Number(new Date()) + 9999 });

        return response.json({ token, user: {_id: user._id, name: user.name, email: user.email}});
    } catch (err) {
        console.log(err);
        return response.status('401').json({ error: "Could not sign in" });
    }
};

const signout = (request: IRequest, response: IResponse) => {
    response.clearCookie("t");
    return response.status('200').json({
        message: "signed out"
    });
};

const requireSignin = expressJwt({
    secret: config.jwtSecret,
    userProperty: 'auth'
});

const hasAuthorization = (request: IRequest, response: IResponse, next: Function) => {
    const authorized = request.profile && request.auth && request.profile._id == request.auth._id;
    if (!(authorized)) {
        return response.status('403').json({
            error: "User is not authorized"
        })
    };
    next();
};

module.exports = {
    signin,
    signout,
    requireSignin,
    hasAuthorization
};
