const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

const analyzeLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 5,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    keyGenerator: (req, res) =>
        req.user?.id?.toString() || ipKeyGenerator(req, res),
    message: {
        error: {
            message: "too many analyses - please wait a minute and retry."
        }
    },
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    keyGenerator: (req, res) => ipKeyGenerator(req, res),
    message: {
        error: {
            message: "too many auth attempts - please wait and retry."
        }
    },
})

module.exports = { analyzeLimiter, authLimiter };