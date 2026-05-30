import { createClient, RedisClientType } from 'redis';
import { env } from './env';

let redisClient: RedisClientType | null = null;

export function getRedisClient(): RedisClientType {
  if (!redisClient) {
    throw new Error('Redis client is not initialized. Call connectRedis() first.');
  }
  return redisClient;
}

export async function connectRedis(): Promise<RedisClientType> {
  if (redisClient?.isOpen) {
    return redisClient;
  }

  redisClient = createClient({ url: env.REDIS_URL });

  redisClient.on('error', (err) => {
    console.error('Redis client error:', err);
  });

  await redisClient.connect();
  console.log('Redis connected successfully');

  return redisClient;
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient?.isOpen) {
    await redisClient.quit();
    redisClient = null;
    console.log('Redis disconnected');
  }
}
