const ApiError = require("../utils/ApiError")

const validate = (schema, source = "body") => (req, res, next) => {
    const reqSource = source === "param" ? "params" : source;
    const result = schema.safeParse(req[reqSource])
    if (!result.success) {
        return next(ApiError.badRequest("Validation Failed", result.error.issues))
    }
    req[reqSource] = result.data;
    next();
}

module.exports = { validate };