import redisClient from "../config/redisClient.js";

const windowSec = 10 * 60; // 10 minutes window in seconds
const maxRequests = 100;

export const customRateLimiter = async (req, res, next) => {
  try {
    let ip = req.ip || req.connection.remoteAddress || "unknown";

    if (ip === "::1" || ip === "::ffff:127.0.0.1") ip = "127.0.0.1";

    // Safe IP formatting
    ip = ip.replace(/[^0-9a-fA-F.]/g, "");

    const redisKey = `rate-limit:${ip}`;

    const requestCount = await redisClient.incr(redisKey);

    if (requestCount === 1) {
      await redisClient.expire(redisKey, windowSec);
    }

    const ttl = await redisClient.ttl(redisKey);
    const ttlMinutes = Math.ceil(ttl / 60);

    if (requestCount > maxRequests) {
      return res.status(429).json({
        success: false,
        message: `Too many requests. Try again in ${ttlMinutes} minutes.`,
        retryAfter: ttl,
      });
    }

    next();
  } catch (err) {
    console.error("RateLimiter Error:", err);
    next();
  }
};
