import { StatusCodes } from 'http-status-codes';
import ApiError from '../../utils/ApiError';
import { UserRepository } from '../users/users.repository';
import { ILoginPayload, ILogoutPayload } from './auth.interface';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken, decodeToken } from '../../utils/jwt.utils';
import { RedisUtils } from '../../utils/redis.utils';
import { resolveUserPermissions } from '../../utils/resolveUserPermissions';

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

  // ⑥Refresh token Redis
  await RedisUtils.setCache(
    `refreshToken:${user.id}`,
    refreshToken,
    7 * 24 * 60 * 60 //7 days in seconds
  );

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
  // Token validation
  const decoded = decodeToken(refreshToken);
  if (!decoded) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid token.');

  const stored = await RedisUtils.getCache<string>(`refreshToken:${decoded.userId}`);
  if (!stored || stored !== refreshToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid or expired token.');
  }
  //   Check user existence and status
  const user = await UserRepository.getUserById(decoded.userId);
  if (!user) throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not found.');

  // ③ Status check
  if (user.status === 'SUSPENDED') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Your account has been suspended.');
  }
  if (user.status === 'BANNED') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Your account has been banned.');
  }

  // ④ Fresh permissions resolve করো
  const permissions = await resolveUserPermissions(user.id);

  // ⑤ নতুন access token বানাও
  const newAccessToken = generateAccessToken(user.id, user.email, user.role.name, permissions);

  return { accessToken: newAccessToken };
};

const logout = async (payload: ILogoutPayload) => {
  // ① Access token blacklist করো
  const decoded = decodeToken(payload.accessToken);
  if (decoded && decoded.exp) {
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await RedisUtils.setCache(`blacklist:${payload.accessToken}`, 'true', ttl);
    }
  }

  // ② Refresh token Redis থেকে delete করো
  await RedisUtils.deleteCache(`refreshToken:${payload.userId}`);

  // ③ Permission cache clear করো
  await RedisUtils.deleteCache(`permissions:${payload.userId}`);
};

export const AuthService = {
  login,
  refresh,
  logout,
};
