import colors from 'colors';
import { Redis } from '@upstash/redis';
import config from './index';

export const redisClient = new Redis({
  url: config.redis.url,
  token: config.redis.token,
});

// Simple connection test
export const testRedisConnection = async (): Promise<void> => {
  try {
    await redisClient.ping();
    console.log(colors.green('✅ Redis connected'));
  } catch (error) {
    console.error(colors.red('❌ Redis connection failed:'), error);
    throw error;
  }
};

// Graceful shutdown (Upstash Redis doesn't need explicit closing)
export const closeRedis = async (): Promise<void> => {
  console.log(colors.green('✅ Redis connection closed'));
};
