class ApiError extends Error {
    constructor(statusCode, message, details) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
    static badRequest(message, details = "") {
        return new ApiError(400, message, details);
    }
    static unAuthorized(message, details = "") {
        return new ApiError(401, message, details);
    }
    static forbidden(message, details = "") {
        return new ApiError(403, message, details);
    }
    static notFound(message, details = "") {
        return new ApiError(404, message, details);
    }
    static conflict(message, details = "") {
        return new ApiError(409, message, details);
    }
    static tooManyRequests(message, details = "") {
        return new ApiError(429, message, details);
    }
    static internalServerError(message, details = "") {
        return new ApiError(500, message, details);
    }
}

module.exports = ApiError;