import { database } from '../config/database.config';
import { RedisUtils } from './redis.utils';
export const resolveUserPermissions = async (userId: string): Promise<string[]> => {
  const cached = await RedisUtils.getCache<string[]>(`permissions:${userId}`);
  if (cached) return cached;

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
      // ③ User এর manually দেওয়া permissions আনো
      userPermissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  if (!user) return [];

  // ④ Role এর permissions নাও
  const rolePermissions = user.role.rolePermissions.map(rp => rp.permission.atom);
    // ⑤ User এর manually granted permissions বের করো
  const grantedPermissions = user.userPermissions
    .filter(up => !up.isRevoked)
    .map(up => up.permission.atom);

  // ⑥ Revoked permission atoms বের করো
  const revokedPermissions = user.userPermissions
    .filter(up => up.isRevoked)
    .map(up => up.permission.atom);

  const allPermissions = [...new Set([...rolePermissions, ...grantedPermissions])].filter(
    atom => !revokedPermissions.includes(atom)
  );

  // ⑧ Redis এ cache করো
  await RedisUtils.setCache(`permissions:${userId}`, allPermissions, 60 * 60); // 1 hour cache

  return allPermissions;
};
export const invalidatePermissionCache = async (userId: string): Promise<void> => {
  await RedisUtils.deleteCache(`permissions:${userId}`);
};
