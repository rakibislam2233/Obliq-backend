import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../utils/ApiError';
import {
  decodeToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt.utils';
import { RedisUtils } from '../../utils/redis.utils';
import { resolveUserPermissions } from '../../utils/resolveUserPermissions';
import logger from '../../utils/logger';
import { AuditLogRepository } from '../auditLogs/auditLogs.repository';
import { UserRepository } from '../users/users.repository';
import { ILoginPayload, ILogoutPayload } from './auth.interface';

const login = async (payload: ILoginPayload) => {
  // User exists check
  const user = await UserRepository.getUserByEmail(payload.email);
  if (!user) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid credentials.');

  // Status check
  if (user.status === 'SUSPENDED') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Your account has been suspended.');
  }
  if (user.status === 'BANNED') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Your account has been banned.');
  }

  // Password check
  const isPasswordValid = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordValid) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid credentials.');

  // Permissions resolve
  const permissions = await resolveUserPermissions(user.id);

  // Tokens generate
  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(user.id, user.email, user.role.name, permissions),
    generateRefreshToken(user.id, user.email, user.role.name),
  ]);

  // Refresh token Redis store
  await RedisUtils.setCache(
    `refreshToken:${user.id}`,
    refreshToken,
    7 * 24 * 60 * 60 //7 days in seconds
  );

  // Audit log — User Logged In
  await AuditLogRepository.createLog({
    actorId: user.id,
    action: 'User Logged In',
    targetType: 'User',
    targetId: user.id,
    meta: {
      fullName: user.fullName,
      email: user.email,
      role: user.role.name,
    },
  }).catch((err) => logger.warn('Audit log failed [User Logged In]:', err));

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role.name,
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

  // Generate new access token
  const newAccessToken = generateAccessToken(user.id, user.email, user.role.name, permissions);

  return { accessToken: newAccessToken };
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
  }).catch((err) => logger.warn('Audit log failed [User Logged Out]:', err));
};

export const AuthService = {
  login,
  refresh,
  logout,
};
