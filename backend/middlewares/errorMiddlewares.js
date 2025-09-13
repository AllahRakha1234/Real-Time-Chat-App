import logger from "../config/logger/index.js"; // <-- your Winston logger

// 404 Handler
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global Error Handler
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Log error with Winston
  logger.error({
    message: err.message,
    status: statusCode,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    query: req.query,
    params: req.params,
  });

  res.status(statusCode).json({
    status: statusCode,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }), // Show stack only in dev
    path: req.originalUrl,
  });
};

export { notFound, errorHandler };
