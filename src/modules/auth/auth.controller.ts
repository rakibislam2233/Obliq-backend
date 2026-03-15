import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import config from '../../config';
import ApiError from '../../utils/ApiError';
import sendResponse from '../../utils/sendResponse';
import { ILoginPayload } from './auth.interface';
import { AuthService } from './auth.service';

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const getCookieOptions = () => ({
  httpOnly: true,
  secure: config.env === 'production',
  sameSite: 'strict' as const,
  maxAge: REFRESH_COOKIE_MAX_AGE,
  path: '/',
});

// POST /api/v1/auth/login
const login = asyncHandler(async (req: Request, res: Response) => {
  const payload = req.body as ILoginPayload;
  const result = await AuthService.login(payload);

  res.cookie(REFRESH_COOKIE_NAME, result.tokens.refreshToken, getCookieOptions());

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Login successful.',
    data: result,
  });
});

// POST /api/v1/auth/refresh
const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken =
    (req.cookies?.[REFRESH_COOKIE_NAME] as string) || (req.body?.refreshToken as string);

  if (!refreshToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Refresh token is missing.');
  }

  // console.log('Refresh Token', refreshToken);
  const result = await AuthService.refresh(refreshToken);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Access token refreshed successfully.',
    data: result,
  });
});

// POST /api/v1/auth/logout
const logout = asyncHandler(async (req: Request, res: Response) => {
  const authorization = req.headers.authorization;
  const accessToken = authorization?.startsWith('Bearer ')
    ? authorization.slice(7)
    : authorization || '';

  if (!req.user?.userId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized user context.');
  }

  if (!accessToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Access token is missing.');
  }

  await AuthService.logout({
    userId: req.user.userId,
    accessToken,
  });

  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    path: '/',
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Logout successful.',
  });
});

export const AuthController = {
  login,
  refresh,
  logout,
};
