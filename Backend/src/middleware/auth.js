const env = require("../config/env.js");
const { verifyToken } = require("../utils/jwt.js");
const ApiError = require("../utils/ApiError.js");
const User = require("../models/User.js");

async function requireAuth(req, res, next) {
    try {
        const token = req.cookies[env.cookieName];
        if (!token) throw ApiError.unAuthorized();

        const payload = verifyToken(token);
        const user = await User.findById(payload.sub);
        if (!user) throw ApiError.unAuthorized("Session no longer valid")

        req.user = user;
        next();
    }
    catch (err) {
        if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
            return next(ApiError.unAuthorized("Invalid or expired session"))
        }
        next(err);
    }
}

module.exports = { requireAuth };

