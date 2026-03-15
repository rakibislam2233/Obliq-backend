import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import config from '../../config';
import ApiError from '../../utils/ApiError';
import {
  decodeToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt.utils';
import { RedisUtils } from '../../utils/redis.utils';
import { resolveUserPermissions } from '../../utils/resolveUserPermissions';
import { sendEmail } from '../../utils/sendEmail';
import { AuditLogRepository } from '../auditLogs/auditLogs.repository';
import { UserRepository } from '../users/users.repository';
import { ILoginPayload, ILogoutPayload } from './auth.interface';

const getAuthAttemptKey = (email: string) => `auth:attempts:${email.toLowerCase()}`;
const getAuthLockKey = (email: string) => `auth:lock:${email.toLowerCase()}`;

const failLoginAttempt = async (email: string): Promise<never> => {
  const attemptsKey = getAuthAttemptKey(email);
  const lockKey = getAuthLockKey(email);
  const lockSeconds = config.auth.lockTime * 60;

  const attempts = await RedisUtils.incrementCounter(attemptsKey);

  if (attempts === 1) {
    await RedisUtils.updateTTL(attemptsKey, lockSeconds);
  }

  if (attempts >= config.auth.maxLoginAttempts) {
    await RedisUtils.setCache(lockKey, true, lockSeconds);
    await RedisUtils.deleteCache(attemptsKey);
    throw new ApiError(
      StatusCodes.TOO_MANY_REQUESTS,
      `Too many failed attempts. Try again after ${config.auth.lockTime} minute(s).`
    );
  }

  throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid credentials.');
};

const login = async (payload: ILoginPayload) => {
  const normalizedEmail = payload.email.toLowerCase().trim();
  const isLocked = await RedisUtils.existsCache(getAuthLockKey(normalizedEmail));
  if (isLocked) {
    throw new ApiError(
      StatusCodes.TOO_MANY_REQUESTS,
      `Too many failed attempts. Try again after ${config.auth.lockTime} minute(s).`
    );
  }

  // User exists check
  const user = await UserRepository.getUserByEmail(normalizedEmail);
  if (!user) {
    await failLoginAttempt(normalizedEmail);
  }

  const existingUser = user!;

  // Status check
  if (existingUser.status === 'SUSPENDED') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Your account has been suspended.');
  }
  if (existingUser.status === 'BANNED') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Your account has been banned.');
  }

  // Password check
  const isPasswordValid = await bcrypt.compare(payload.password, existingUser.password);
  if (!isPasswordValid) {
    await failLoginAttempt(normalizedEmail);
  }

  await RedisUtils.deleteCache(getAuthAttemptKey(normalizedEmail));
  await RedisUtils.deleteCache(getAuthLockKey(normalizedEmail));

  // Permissions resolve
  const permissions = await resolveUserPermissions(existingUser.id);

  // Tokens generate
  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(existingUser.id, existingUser.email, existingUser.role.name, permissions),
    generateRefreshToken(existingUser.id, existingUser.email, existingUser.role.name),
  ]);

  // Refresh token Redis store
  await RedisUtils.setCache(
    `refreshToken:${existingUser.id}`,
    refreshToken,
    7 * 24 * 60 * 60 //7 days in seconds
  );

  // Audit log — User Logged In
  await AuditLogRepository.createLog({
    actorId: existingUser.id,
    action: 'User Logged In',
    targetType: 'User',
    targetId: existingUser.id,
    meta: {
      fullName: existingUser.fullName,
      email: existingUser.email,
      role: existingUser.role.name,
    },
  });

  return {
    user: {
      id: existingUser.id,
      fullName: existingUser.fullName,
      email: existingUser.email,
      role: existingUser.role.name,
      permissions,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  };
};

const refresh = async (refreshToken: string) => {
  // Token signature + expiration validation
  const decoded = verifyRefreshToken(refreshToken);
  // console.log('Decoded', decoded);

  const stored = await RedisUtils.getCache<string>(`refreshToken:${decoded.userId}`);
  if (!stored || stored !== refreshToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid or expired token.');
  }
  //   Check user existence and status
  const user = await UserRepository.getUserById(decoded.userId);
  if (!user) throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not found.');

  // Status check
  if (user.status === 'SUSPENDED') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Your account has been suspended.');
  }
  if (user.status === 'BANNED') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Your account has been banned.');
  }

  // Permissions resolve
  const permissions = await resolveUserPermissions(user.id);

  // Rotate refresh token and issue new access token
  const [newAccessToken, newRefreshToken] = await Promise.all([
    generateAccessToken(user.id, user.email, user.role.name, permissions),
    generateRefreshToken(user.id, user.email, user.role.name),
  ]);

  await RedisUtils.setCache(
    `refreshToken:${user.id}`,
    newRefreshToken,
    7 * 24 * 60 * 60 // 7 days in seconds
  );

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

const forgotPassword = async (email: string) => {
  const user = await UserRepository.getUserByEmail(email);

  if (!user) {
    return;
  }

  const resetToken = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      purpose: 'reset-password',
    },
    config.jwt.resetPasswordSecret,
    { expiresIn: config.jwt.resetPasswordExpiration } as jwt.SignOptions
  );

  const resetLink = `${config.backend.baseUrl}/api/v1/auth/reset-password?token=${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: 'Reset Your Password',
    html: `<p>Hello ${user.fullName},</p><p>Click this link to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>This link will expire in ${config.jwt.resetPasswordExpiration}.</p>`,
  });
};

const resetPassword = async (token: string, newPassword: string) => {
  let decoded: any;

  try {
    decoded = jwt.verify(token, config.jwt.resetPasswordSecret) as {
      userId: string;
      purpose: string;
    };
  } catch {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid or expired reset token.');
  }

  if (decoded.purpose !== 'reset-password') {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid reset token purpose.');
  }

  const user = await UserRepository.getUserById(decoded.userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await UserRepository.updateUserPasswordById(user.id, hashedPassword);

  await RedisUtils.deleteCache(`refreshToken:${user.id}`);

  await AuditLogRepository.createLog({
    actorId: user.id,
    action: 'Password Reset',
    targetType: 'User',
    targetId: user.id,
  });
};

const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
  const user = await UserRepository.getUserById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Current password is incorrect.');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await UserRepository.updateUserPasswordById(userId, hashedPassword);

  await RedisUtils.deleteCache(`refreshToken:${userId}`);

  await AuditLogRepository.createLog({
    actorId: userId,
    action: 'Password Changed',
    targetType: 'User',
    targetId: userId,
  });
};

const logout = async (payload: ILogoutPayload) => {
  // Access token Redis blacklist
  const decoded = decodeToken(payload.accessToken);
  if (decoded && decoded.exp) {
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await RedisUtils.setCache(`blacklist:${payload.accessToken}`, 'true', ttl);
    }
  }

  // Refresh token Redis delete
  await RedisUtils.deleteCache(`refreshToken:${payload.userId}`);

  // Invalidate permissions cache
  await RedisUtils.deleteCache(`permissions:${payload.userId}`);

  // Audit log — User Logged Out
  await AuditLogRepository.createLog({
    actorId: payload.userId,
    action: 'User Logged Out',
    targetType: 'User',
    targetId: payload.userId,
  });
};

export const AuthService = {
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
};
