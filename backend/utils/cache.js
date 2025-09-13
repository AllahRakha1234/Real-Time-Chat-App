import redisClient from "../config/redisClient.js";
import logger from "../config/logger/index.js";

const DEFAULT_EXPIRY = process.env.CACHE_EXPIRY || 3600; // 1 Hour

export async function getOrSetCache(key, cb, expiry = DEFAULT_EXPIRY) {
    try {
        const cachedData = await redisClient.get(key);

        if (cachedData) {
            logger.info(`Cache hit for key: ${key}`);
            const parsed = JSON.parse(cachedData);
            return Array.isArray(parsed) ? parsed : [];
        }

        logger.warn(`Cache miss for key: ${key}`);
        const freshData = await cb();

        if (freshData) {
            await redisClient.setEx(key, expiry, JSON.stringify(freshData));
            logger.debug(`Cache stored for key: ${key}, expiry: ${expiry}s`);
        }

        return Array.isArray(freshData) ? freshData : [];
    } catch (err) {
        logger.error(`Redis cache error: ${err.message}`, { stack: err.stack });
        return cb(); // fallback to DB
    }
}

export async function clearCache(key) {
    try {
        await redisClient.del(key);
        logger.info(`Cache cleared 🧹 for key: ${key}`);
    } catch (err) {
        logger.error(`Error clearing cache: ${err.message}`, { stack: err.stack });
    }
}
