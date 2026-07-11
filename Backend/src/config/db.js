const dns = require("dns")
dns.setServers(["8.8.8.8", "1.1.1.1"])
const dnsPromises = require("dns/promises")
dnsPromises.setServers(["8.8.8.8", "1.1.1.1"])

const mongoose = require("mongoose");
const env = require("./env");

mongoose.set("strictQuery", true);

async function connectDB() {
    const conn = await mongoose.connect(env.mongoUri, {
        serverSelectionTimeoutMS: 10_000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on("error", (err) => {
        console.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on("disconnected", () => {
        console.warn("MongoDB disconnected");
    })
}

module.exports = connectDB;