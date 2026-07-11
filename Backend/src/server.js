const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const morgan = require("morgan")

const env = require("./config/env.js")
const connectDB = require("./config/db.js")
const { errorHandler, notFound } = require("./middleware/errorHandler.js")

const healthRouter = require("./routes/health.js")
const authRouter = require("./routes/auth.js")
const resumesRouter = require("./routes/resumes.js")

const dashboardRouter = require("./routes/dashboard.js")
const insightsRouter = require("./routes/insights.js")
const versionsRouter = require("./routes/versions.js")
const historyRouter = require("./routes/history.js")

const app = express()

app.set("trust proxy", 1)
app.use(
    cors({
        origin: true,
        credentials: true,
    })
)
app.use(express.json({ limit: "1mb" }))
app.use(express.urlencoded({ extended: true, limit: "1mb" }))
app.use(cookieParser())
if (!env.isProd) app.use(morgan("dev"))

app.use("/api/health", healthRouter)
app.use("/api/auth", authRouter);
app.use("/api/resumes", resumesRouter);

// resume dashboard
app.use("/api/dashboard", dashboardRouter);
app.use("/api/insights", insightsRouter);
app.use("/api/versions", versionsRouter);
app.use("/api/history", historyRouter);


app.use(notFound)
app.use(errorHandler)


async function startServer() {
    try {
        await connectDB()
        app.listen(env.port, () => {
            console.log(`server is listening on http://localhost:${env.port} (${env.nodeEnv})`)
        })
    } catch (err) {
        console.error("Failed to start server", err)
        process.exit(1)
    }
}

process.on("unhandledRejection", (reason) => {
    console.error("unhandledRejection", reason)
})

startServer()

module.exports = app