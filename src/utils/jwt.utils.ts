import { addDays, addMinutes } from 'date-fns';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import config from '../config';
import { IDecodedToken, ITokenPayload, TokenType } from '../shared/interfaces/jwt.interface';
import ApiError from './ApiError';

export const generateAccessToken = (
  userId: string,
  email: string,
  role: string,
  permissions: string[]
): string => {
  const payload: ITokenPayload = {
    userId,
    email,
    role,
    permissions,
    type: TokenType.ACCESS,
  };
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiration,
  } as jwt.SignOptions);
};

export const generateRefreshToken = (userId: string, email: string, role: string): string => {
  const payload = {
    userId,
    email,
    role,
    type: TokenType.REFRESH,
  };
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiration,
  } as jwt.SignOptions);
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

// ==================== Utilities ====================
export const decodeToken = (token: string): IDecodedToken | null => {
  try {
    return jwt.decode(token) as IDecodedToken;
  } catch {
    return null;
  }
};
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  return Date.now() >= decoded.exp * 1000;
};
