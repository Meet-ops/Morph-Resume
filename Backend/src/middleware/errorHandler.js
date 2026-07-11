const env = require('../config/env');
const ApiError = require('../utils/ApiError');

function notFound(req, res, next) {
    next(ApiError.notFound(`Can't find ${req.method} ${req.originalUrl} on server`));
}

function errorHandler(err, req, res, next) {
    let status = err.statusCode || 500;
    let message = err.message || "Internal server error";
    let details = err.details;

    if (err.name === "ValidationError" && err.isOperational) {
        status = 400;
        details = Object.fromEntries(
            Object.entries(err.errors).map(([k, v]) => [k, v.message])
        );
        message = "Validation Failed";
    } else if (err.name === "CastError") {
        status = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    } else if (err.code === 11000) {
        status = 409;
        message = "Duplicate Key";
        details = err.keyValue;
    } else if (err.name === "ZodError") {
        status = 400;
        message = "Validation Failed";
        details = err.issues;
    }

    if (status >= 500) {
        console.error(`[${req.method} ${req.originalUrl}]`, err);
    }

    res.status(status).json({
        error: {
            message,
            ...(details ? { details } : {}),
            ...(env.isProd ? {} : { stack: err.stack }),
        },
    });
}

module.exports = { notFound, errorHandler };