
import winston from "winston";
import path from "path";
import dotenv from "dotenv";
import "winston-mongodb";

dotenv.config();

const logDir = "logs";
const level = process.env.NODE_ENV === "production" ? "info" : "debug";

const logger = winston.createLogger({
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        verbose: 4,
        debug: 5,
        silly: 6,
    },
    level,
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        // Errors to file
        new winston.transports.File({
            filename: path.join(logDir, "error.log"),
            level: "error",
        }),
        // All info+ to combined file
        new winston.transports.File({
            filename: path.join(logDir, "combined.log"),
        }),
        // System-level logs to MongoDB
        new winston.transports.MongoDB({
            level: "info",
            db: process.env.MONGO_URI,
            options: { useUnifiedTopology: true },
            collection: "system_logs",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
        }),
    ],
});

// Console logs in development
if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        })
    );
}

export default logger;
