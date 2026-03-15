import { database } from '../config/database.config';
import { RedisUtils } from './redis.utils';
export const resolveUserPermissions = async (userId: string): Promise<string[]> => {
  // Check cache first
  const cached = await RedisUtils.getCache<string[]>(`permissions:${userId}`);
  if (cached) return cached;

  // If not in cache, fetch from database
  const user = await database.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      },
      userPermissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  if (!user) return [];

  // Calculate effective permissions
  const rolePermissions = user.role.rolePermissions.map(rp => rp.permission.atom);
  const grantedPermissions = user.userPermissions
    .filter(up => !up.isRevoked)
    .map(up => up.permission.atom);
  const revokedPermissions = user.userPermissions
    .filter(up => up.isRevoked)
    .map(up => up.permission.atom);

  const allPermissions = [...new Set([...rolePermissions, ...grantedPermissions])].filter(
    atom => !revokedPermissions.includes(atom)
  );
  await RedisUtils.setCache(`permissions:${userId}`, allPermissions, 60 * 5); // 5 minutes cache

  return allPermissions;
};
export const invalidatePermissionCache = async (userId: string): Promise<void> => {
  await RedisUtils.deleteCache(`permissions:${userId}`);
};
