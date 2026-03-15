import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/ApiError';
import { verifyAccessToken } from '../utils/jwt.utils';
import { RedisUtils } from '../utils/redis.utils';

const auth =
  (requiredPermission?: string) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get authorization header
      const token = req.headers.authorization;

      if (!token) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authorization header is missing');
      }
      const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;

      const isBlacklisted = await RedisUtils.existsCache(`blacklist:${tokenValue}`);
      if (isBlacklisted) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'Token has been invalidated.',
        });
        return;
      }

      // Verify token and get decoded user
      const verifiedUser = verifyAccessToken(tokenValue);
      req.user = verifiedUser;

      const userPermissions = req.user?.permissions ?? [];

      if (requiredPermission && !userPermissions.includes(requiredPermission)) {
        res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: 'You do not have permission to perform this action.',
        });
        return;
      }
      next();
    } catch (error) {
      next(error);
    }
  };

export { auth };

