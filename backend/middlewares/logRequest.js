import requestLogger from "../config/logger/requestLogger.js";

export const logRequest = (req, res, next) => {

    // Capture response data
    const oldSend = res.send;

    res.send = function (body) {
        // Save body temporarily to log later
        res.locals.responseBody = body;
        return oldSend.call(this, body);
    };

    res.on("finish", () => {
        try {
            // Log only API routes
            if (req?.originalUrl?.startsWith("/api")) {

                // Prepare response info (status + short message)
                let responseMessage;
                try {
                    const parsedBody = JSON.parse(res.locals.responseBody);
                    responseMessage = parsedBody?.message || "No message";
                } catch {
                    responseMessage = String(res.locals.responseBody).slice(0, 100); // truncate for safety
                }

                // Prepare metadata (structured fields)
                const metadata = {
                    timestamp: new Date().toISOString(),
                    method: req.method,
                    url: req.originalUrl,
                    statusCode: res.statusCode,
                    query: req.query || {},
                    body: req.body || {},
                    response: {
                        status: res.statusCode,
                        message: responseMessage,
                    },
                };

                // Log to MongoDB with structured data
                requestLogger.info("HTTP Request Log", metadata);
            }
        } catch (err) {
            console.error("Error in logRequest middleware:", err);
        }
    });

    next();
};