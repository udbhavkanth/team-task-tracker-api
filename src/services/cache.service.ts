import { getRedisClient } from '../config/redis';

export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    try {
      const client = getRedisClient();
      const value = await client.get(key);
      if (value === null) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    try {
      const client = getRedisClient();
      await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const client = getRedisClient();
      await client.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async deleteByPattern(pattern: string): Promise<number> {
    try {
      const client = getRedisClient();
      let deleted = 0;

      for await (const key of client.scanIterator({ MATCH: pattern })) {
        await client.del(key);
        deleted += 1;
      }

      return deleted;
    } catch (error) {
      console.error('Cache deleteByPattern error:', error);
      return 0;
    }
  }
}

export const cacheService = new CacheService();
