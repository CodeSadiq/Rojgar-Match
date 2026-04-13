import redis from './redis';

const DEFAULT_TTL = 3600; // 1 hour

export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    if (!process.env.UPSTASH_REDIS_REST_URL) return null;
    const data = await redis.get(key);
    return data as T;
  } catch (error) {
    console.error(`Cache Get Error [${key}]:`, error);
    return null;
  }
}

export async function setCachedData(key: string, data: any, ttl: number = DEFAULT_TTL): Promise<void> {
  try {
    if (!process.env.UPSTASH_REDIS_REST_URL) return;
    await redis.set(key, data, { ex: ttl });
  } catch (error) {
    console.error(`Cache Set Error [${key}]:`, error);
  }
}

export async function invalidateCache(key: string): Promise<void> {
  try {
    if (!process.env.UPSTASH_REDIS_REST_URL) return;
    await redis.del(key);
  } catch (error) {
    console.error(`Cache Invalidation Error [${key}]:`, error);
  }
}

export async function invalidateCachePattern(pattern: string): Promise<void> {
  try {
    if (!process.env.UPSTASH_REDIS_REST_URL) return;
    // Upstash doesn't support KEYS pattern easily in a single REST call without scanning
    // but for this app we will mostly use direct keys
    await redis.del(pattern);
  } catch (error) {
    console.error(`Cache Pattern Invalidation Error [${pattern}]:`, error);
  }
}
