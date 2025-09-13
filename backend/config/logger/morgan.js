import morgan from "morgan";
import logger from "./index.js";

// Create a stream for Morgan to write to Winston
const stream = {
    write: (message) => logger.http(message.trim()), // use HTTP log level
};

const morganMiddleware = morgan(
    ":method :url :status :res[content-length] - :response-time ms",
    { stream }
);

export default morganMiddleware;
