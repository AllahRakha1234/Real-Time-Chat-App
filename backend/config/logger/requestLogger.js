import winston from "winston";
import "winston-mongodb";
import dotenv from "dotenv";

dotenv.config();

const requestLogger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.MongoDB({
            db: process.env.MONGO_URI,
            options: { useUnifiedTopology: true },
            collection: "request_logs",
        }),
    ],
});

export default requestLogger;