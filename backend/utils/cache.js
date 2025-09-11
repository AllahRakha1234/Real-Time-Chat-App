import redisClient from "../config/redisClient.js";

const DEFAULT_EXPIRY = process.env.CACHE_EXPIRY || 3600; // 1 Hour

export async function getOrSetCache(key, cb, expiry = DEFAULT_EXPIRY) {
    try {
        const cachedData = await redisClient.get(key);
        if (cachedData) {
            console.log(`Cache hit ✅ for key: ${key}`);
            return JSON.parse(cachedData);
        }

        console.log(`Cache miss ❌ for key: ${key}`);
        const freshData = await cb();

        if (freshData) {
            await redisClient.setEx(key, expiry, JSON.stringify(freshData));
        }

        return freshData;
    } catch (err) {
        console.error("Redis cache error:", err);
        return cb(); // fallback to DB if Redis fails
    }
}

export async function clearCache(key) {
    try {
        await redisClient.del(key);
        console.log(`Cache cleared 🧹 for key: ${key}`);
    } catch (err) {
        console.error("Error clearing cache:", err);
    }
}


