import { RedisUtils } from '../utils/redis.utils';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import colors from 'colors';
import logger from '../utils/logger';
import { decodeToken } from '../utils/jwt.utils';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}

export interface RateLimitInfo {
  totalRequests: number;
  resetTime: Date;
  remaining: number;
}

const getClientIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = typeof forwarded === 'string' ? forwarded.split(',') : [forwarded[0]];
    return ips[0].trim();
  }

  const realIp = req.headers['x-real-ip'];
  if (realIp && typeof realIp === 'string') {
    return realIp.trim();
  }

  return req.ip || req.socket.remoteAddress || 'unknown';
};

const getClientKey = (req: Request, config: RateLimitConfig, prefix: string): string => {
  if (config.keyGenerator) {
    return `ratelimit:${prefix}:${config.keyGenerator(req)}`;
  }

  const ip = getClientIp(req);
  return `ratelimit:${prefix}:ip:${ip}`;
};

const checkRateLimit = async (key: string, config: RateLimitConfig): Promise<RateLimitInfo> => {
  const now = Date.now();
  const expirySeconds = Math.floor(config.windowMs / 1000);

  try {
    let current = await RedisUtils.incrementCounter(key);
    const exists = await RedisUtils.existsCache(key);
    if (current === 1 || !exists) {
      await RedisUtils.updateTTL(key, expirySeconds);
    }
    let ttl = await RedisUtils.getTTL(key);
    if (ttl === -1) {
      await RedisUtils.updateTTL(key, expirySeconds);
      ttl = expirySeconds;
    }

    const resetTime = new Date(now + ttl * 1000);

    if (current > config.maxRequests) {
      logger.error(colors.red(`🚨 Rate limit exceeded: ${key} (${current}/${config.maxRequests})`));
    }

    return {
      totalRequests: current,
      resetTime,
      remaining: Math.max(0, config.maxRequests - current),
    };
  } catch (error: any) {
    logger.error(colors.red('❌ Rate limit check failed:'), error);
    // Fail-open policy
    return {
      totalRequests: 0,
      resetTime: new Date(now + config.windowMs),
      remaining: config.maxRequests,
    };
  }
};

// ==================== Main Rate Limiter ====================

export const createRateLimiter = (prefix: string, config: RateLimitConfig) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = getClientKey(req, config, prefix);
      const limitInfo = await checkRateLimit(key, config);

      // Rate limit headers
      res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', limitInfo.remaining.toString());
      res.setHeader('X-RateLimit-Reset', limitInfo.resetTime.getTime().toString());

      if (limitInfo.remaining === 0) {
        const minutesUntilReset = Math.ceil((limitInfo.resetTime.getTime() - Date.now()) / 60000);

        const message =
          config.message ||
          `Too many requests. Please try again after ${minutesUntilReset} minute${minutesUntilReset !== 1 ? 's' : ''}.`;

        logger.info(
          colors.yellow(
            `⚠️  Rate limit BLOCKED: ${key} (${limitInfo.totalRequests}/${config.maxRequests})`
          )
        );

        return res.status(StatusCodes.TOO_MANY_REQUESTS).json({
          success: false,
          code: StatusCodes.TOO_MANY_REQUESTS,
          message,
          retryAfter: limitInfo.resetTime.toISOString(),
          timestamp: new Date().toISOString(),
        });
      }

      // Warning when close to limit
      const warningThreshold = Math.ceil(config.maxRequests * 0.1);
      if (limitInfo.remaining <= warningThreshold && limitInfo.remaining > 0) {
        logger.info(
          colors.yellow(
            `⚠️  Approaching limit: ${key} - ${limitInfo.remaining}/${config.maxRequests} remaining`
          )
        );
      }

      next();
    } catch (error: any) {
      logger.error(colors.red('❌ Rate limiter error:'), error);
      next(); // Fail-open
    }
  };
};

// ==================== Utility Functions ====================

export const resetRateLimit = async (identifier: string, prefix: string): Promise<void> => {
  try {
    const key = `ratelimit:${prefix}:ip:${identifier}`;
    await RedisUtils.deleteCache(key);
    logger.info(colors.blue(`🔄 Rate limit reset: ${key}`));
  } catch (error: any) {
    logger.error(colors.red('❌ Failed to reset rate limit:'), error);
  }
};

export const getRateLimitInfo = async (
  identifier: string,
  prefix: string,
  config: RateLimitConfig
): Promise<RateLimitInfo | null> => {
  try {
    const key = `ratelimit:${prefix}:ip:${identifier}`;

    const requestsStr = await RedisUtils.getCache<string>(key);
    const currentRequests = requestsStr ? parseInt(requestsStr, 10) : 0;

    const ttl = await RedisUtils.getTTL(key);

    if (ttl === -2) {
      return null;
    }

    const ttlMs = ttl > 0 ? ttl * 1000 : config.windowMs;

    return {
      totalRequests: currentRequests,
      resetTime: new Date(Date.now() + ttlMs),
      remaining: Math.max(0, config.maxRequests - currentRequests),
    };
  } catch (error: any) {
    logger.error(colors.red('❌ Failed to get rate limit info:'), error);
    return null;
  }
};
// ==================== Pre-configured Rate Limiters ====================

// Login rate limiter - IP based
export const loginRateLimiter = createRateLimiter('login', {
  windowMs: 15 * 60 * 1000,
  maxRequests: 20,
  message: 'Too many login attempts. Please try again after 15 minutes.',
});

// Email-based login rate limiter
export const emailLoginRateLimiter = createRateLimiter('login-email', {
  windowMs: 60 * 60 * 1000,
  maxRequests: 3,
  keyGenerator: (req: Request) => {
    const email = req.body.email;
    return email ? `email:${email.toLowerCase()}` : 'unknown';
  },
  message: 'Too many failed login attempts for this email. Please try again after 1 hour.',
});

// Registration rate limiter
export const registerRateLimiter = createRateLimiter('register', {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 100, //default 3 but i am set for development mode 100
  message: 'Too many registration attempts. Please try again after 1 hour.',
});

// OTP verification rate limiter - Session based
export const verifyOtpRateLimiter = createRateLimiter('verify-otp', {
  windowMs: 10 * 60 * 1000,
  maxRequests: 100, //default 3 but i am set for development mode 100
  keyGenerator: (req: Request) => {
    const sessionId = req.body.sessionId;
    return sessionId ? `session:${sessionId}` : `ip:${req.ip}`;
  },
  message: 'Too many OTP verification attempts. Please request a new OTP.',
});

//Resend OTP rate limiter
export const resendOtpRateLimiter = createRateLimiter('resend-otp', {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 100, //default 5 but i am set for development mode 100
  message: 'Too many resend OTP requests. Please try again after 1 hour.',
});

//forgot password rate limiter
export const forgotPasswordRateLimiter = createRateLimiter('forgot-password', {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5, //default 5 but i am set for development mode 100
  message: 'Too many forgot password requests. Please try again after 1 hour.',
});

// Password reset rate limiter
export const resetPasswordRateLimiter = createRateLimiter('reset-password', {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 100, //default 5 but i am set for development mode 100
  message: 'Too many password reset requests. Please try again after 1 hour.',
});

// Refresh token rate limiter - User based
export const refreshTokenRateLimiter = createRateLimiter('refresh-token', {
  windowMs: 60 * 60 * 1000,
  maxRequests: 20,
  keyGenerator: (req: Request) => {
    const token = req.body.refreshToken;
    if (token) {
      try {
        const decoded = decodeToken(token);
        return decoded?.userId ? `user:${decoded.userId}` : `ip:${req.ip}`;
      } catch {
        return `ip:${req.ip || 'unknown'}`;
      }
    }
    return `ip:${req.ip || 'unknown'}`;
  },
  message: 'Too many token refresh attempts. Please try again later.',
});

/**
 * General API rate limiter
 * 100 requests per 15 minutes
 */
export const generalApiRateLimiter = createRateLimiter('api', {
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
  message: 'Too many API requests. Please try again later.',
});

/**
 * Strict rate limiter for sensitive operations
 * 10 requests per 5 minutes
 */
export const strictRateLimiter = createRateLimiter('strict', {
  windowMs: 5 * 60 * 1000,
  maxRequests: 10,
  message: 'Too many sensitive operation attempts. Please wait 5 minutes.',
});

/**
 * User-specific rate limiter (dynamic)
 * 20 requests per minute per user
 */
export const userRateLimiter = (userId: string) =>
  createRateLimiter('user', {
    windowMs: 60 * 1000,
    maxRequests: 20,
    keyGenerator: () => `user:${userId}`,
    message: 'Too many requests. Please slow down.',
  });

// Heavy operation rate limiter
export const heavyOperationRateLimiter = createRateLimiter('heavy-operation', {
  windowMs: 60 * 60 * 1000,
  maxRequests: 5,
  message: 'Too many heavy operations. Please try again after 1 hour.',
  keyGenerator: (req: Request) => req.user?.userId || req.ip || 'unknown',
});

// Burst protection
export const burstProtectionLimiter = createRateLimiter('burst', {
  windowMs: 10 * 1000,
  maxRequests: 30,
  message: 'Too many requests in a short time. Please slow down.',
});

export const rateLimiters = {
  loginRateLimiter,
  emailLoginRateLimiter,
  registerRateLimiter,
  verifyOtpRateLimiter,
  resendOtpRateLimiter,
  forgotPasswordRateLimiter,
  resetPasswordRateLimiter,
  refreshTokenRateLimiter,
  generalApiRateLimiter,
  strictRateLimiter,
  userRateLimiter,
  heavyOperationRateLimiter,
  burstProtectionLimiter,
};
