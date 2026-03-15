import { addDays, addMinutes } from 'date-fns';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import config from '../config';
import { IDecodedToken, ITokenPayload, TokenType } from '../shared/interfaces/jwt.interface';
import ApiError from './ApiError';

// ==================== Helpers ====================
export const getExpirationDate = (expiration: string): Date => {
  const match = expiration.match(/^(\d+)([mhd])$/);
  if (!match) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid expiration format. Use: 15m, 24h, 7d');
  }

  const [, value, unit] = match;
  const timeValue = parseInt(value, 10);

  switch (unit) {
    case 'm':
      return addMinutes(new Date(), timeValue);
    case 'h':
      return addMinutes(new Date(), timeValue * 60);
    case 'd':
      return addDays(new Date(), timeValue);
    default:
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid time unit');
  }
};

export const getTokenTTL = (expiry: string): number => {
  const expirationDate = getExpirationDate(expiry);
  return Math.floor((expirationDate.getTime() - Date.now()) / 1000);
};

// ==================== Token Generation ====================
export const generateAccessToken = (
  userId: string,
  email: string,
  role: string,
  batchId?: string
): string => {
  const payload: ITokenPayload = {
    userId,
    email,
    role,
    batchId,
    type: TokenType.ACCESS,
  };
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiration,
  } as jwt.SignOptions);
};

export const generateRefreshToken = (
  userId: string,
  email: string,
  role: string,
  batchId?: string
): string => {
  const payload: ITokenPayload = {
    userId,
    email,
    role,
    batchId,
    type: TokenType.REFRESH,
  };

  // ✅ Type assertion to fix TypeScript error
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiration,
  } as jwt.SignOptions);
};

export const generateResetPasswordToken = (
  userId: string,
  email: string,
  role: string,
  batchId?: string
): string => {
  const payload: ITokenPayload = {
    userId,
    email,
    role,
    batchId,
    type: TokenType.RESET_PASSWORD,
  };
  try {
    return jwt.sign(payload, config.jwt.resetPasswordSecret, {
      expiresIn: config.jwt.resetPasswordExpiration,
    } as jwt.SignOptions);
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to generate reset password token'
    );
  }
};

// ==================== Token Verification ====================
export const verifyAccessToken = (token: string): IDecodedToken => {
  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret) as IDecodedToken;

    if (decoded.type !== TokenType.ACCESS) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid token');
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid token');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid token');
    }
    throw error;
  }
};

// ==================== Refresh Token Verification ====================
export const verifyRefreshToken = (token: string): IDecodedToken => {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret) as IDecodedToken;

    if (decoded.type !== TokenType.REFRESH) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid token');
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid token');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid token');
    }
    throw error;
  }
};

// ==================== Reset Password Token Verification ====================
export const verifyResetPasswordToken = (token: string): IDecodedToken => {
  try {
    const decoded = jwt.verify(token, config.jwt.resetPasswordSecret) as IDecodedToken;

    if (decoded.type !== TokenType.RESET_PASSWORD) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid token');
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid token');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid token');
    }
    throw error;
  }
};

// ==================== Utilities ====================
export const decodeToken = (token: string): IDecodedToken | null => {
  try {
    return jwt.decode(token) as IDecodedToken;
  } catch {
    return null;
  }
};

// ==================== Token Expiration ====================
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  return Date.now() >= decoded.exp * 1000;
};
