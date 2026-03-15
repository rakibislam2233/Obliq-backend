import { redisClient } from '../config/redis.config';
import colors from 'colors';

// Generic type for cached data
type CachedData<T> = T | null;

const setCache = async <T>(key: string, value: T, ttlSeconds?: number): Promise<void> => {
  try {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await redisClient.setex(key, ttlSeconds, serialized);
    } else {
      await redisClient.set(key, serialized);
    }
  } catch (error) {
    console.error(colors.red(`❌ Redis SET error for key ${key}:`), error);
    throw error;
  }
};

const getCache = async <T>(key: string): Promise<CachedData<T>> => {
  try {
    const data = await redisClient.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(colors.red(`❌ Redis GET error for key ${key}:`), error);
    return null;
  }
};

const deleteCache = async (key: string): Promise<void> => {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error(colors.red(`❌ Redis DEL error for key ${key}:`), error);
    throw error;
  }
};

const deleteCachePattern = async (pattern: string): Promise<number> => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length === 0) return 0;
    return await redisClient.del(...keys);
  } catch (error) {
    console.error(colors.red(`❌ Redis DELETE PATTERN error for pattern ${pattern}:`), error);
    throw error;
  }
};

const existsCache = async (key: string): Promise<boolean> => {
  try {
    const result = await redisClient.exists(key);
    return result === 1;
  } catch (error) {
    console.error(colors.red(`❌ Redis EXISTS error for key ${key}:`), error);
    return false;
  }
};

const getTTL = async (key: string): Promise<number> => {
  try {
    return await redisClient.ttl(key);
  } catch (error) {
    console.error(colors.red(`❌ Redis TTL error for key ${key}:`), error);
    return -2;
  }
};

const updateTTL = async (key: string, ttlSeconds: number): Promise<void> => {
  try {
    await redisClient.expire(key, ttlSeconds);
  } catch (error) {
    console.error(colors.red(`❌ Redis EXPIRE error for key ${key}:`), error);
    throw error;
  }
};

const incrementCounter = async (key: string, amount: number = 1): Promise<number> => {
  try {
    return await redisClient.incrby(key, amount);
  } catch (error) {
    console.error(colors.red(`❌ Redis INCR error for key ${key}:`), error);
    throw error;
  }
};

const setCacheNX = async <T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> => {
  try {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      const result = await redisClient.set(key, serialized, 'EX', ttlSeconds, 'NX');
      return result === 'OK';
    } else {
      const result = await redisClient.setnx(key, serialized);
      return result === 1;
    }
  } catch (error) {
    console.error(colors.red(`❌ Redis SETNX error for key ${key}:`), error);
    throw error;
  }
};

const getMultipleCache = async <T>(keys: string[]): Promise<CachedData<T>[]> => {
  try {
    if (keys.length === 0) return [];
    const values = await redisClient.mget(...keys);
    return values.map(value => (value ? JSON.parse(value) : null));
  } catch (error) {
    console.error(colors.red(`❌ Redis MGET error:`), error);
    return keys.map(() => null);
  }
};

const flushAll = async (): Promise<void> => {
  try {
    await redisClient.flushall();
    console.log(colors.yellow('⚠️ Redis: All data flushed'));
  } catch (error) {
    console.error(colors.red(`❌ Redis FLUSHALL error:`), error);
    throw error;
  }
};

const getKeysByPattern = async (pattern: string): Promise<string[]> => {
  try {
    return await redisClient.keys(pattern);
  } catch (error) {
    console.error(colors.red(`❌ Redis KEYS error for pattern ${pattern}:`), error);
    return [];
  }
};

const hashOperations = {
  setHash: async <T>(key: string, field: string, value: T): Promise<void> => {
    try {
      await redisClient.hset(key, field, JSON.stringify(value));
    } catch (error) {
      console.error(colors.red(`❌ Redis HSET error for key ${key}:`), error);
      throw error;
    }
  },
  getHash: async <T>(key: string, field: string): Promise<CachedData<T>> => {
    try {
      const data = await redisClient.hget(key, field);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(colors.red(`❌ Redis HGET error for key ${key}:`), error);
      return null;
    }
  },
  getAllHash: async <T>(key: string): Promise<Record<string, T>> => {
    try {
      const data = await redisClient.hgetall(key);
      const result: Record<string, T> = {};
      for (const [field, value] of Object.entries(data)) {
        result[field] = JSON.parse(value) as T;
      }
      return result;
    } catch (error) {
      console.error(colors.red(`❌ Redis HGETALL error for key ${key}:`), error);
      return {};
    }
  },
  deleteHash: async (key: string, field: string): Promise<void> => {
    try {
      await redisClient.hdel(key, field);
    } catch (error) {
      console.error(colors.red(`❌ Redis HDEL error for key ${key}:`), error);
      throw error;
    }
  },
  existsHash: async (key: string, field: string): Promise<boolean> => {
    try {
      const result = await redisClient.hexists(key, field);
      return result === 1;
    } catch (error) {
      console.error(colors.red(`❌ Redis HEXISTS error for key ${key}:`), error);
      return false;
    }
  },
};

export const RedisUtils = {
  getCache,
  setCache,
  setCacheNX,
  deleteCache,
  getTTL,
  deleteCachePattern,
  existsCache,
  updateTTL,
  incrementCounter,
  getMultipleCache,
  flushAll,
  getKeysByPattern,
  hashOperations,
};
