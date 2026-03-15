
import { database } from '../config/database.config';
import { RedisUtils } from './redis.utils';

const CACHE_TTL = 5 * 60; // 5 minutes

export const resolveUserPermissions = async (userId: string): Promise<string[]> => {
  // ① Redis cache চেক করো আগে
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

  // ⑤ User এর manually granted permissions নাও (revoked গুলো বাদ)
  const grantedPermissions = user.userPermissions
    .filter(up => !up.isRevoked)
    .map(up => up.permission.atom);

  // ⑥ Revoked permission atoms বের করো
  const revokedPermissions = user.userPermissions
    .filter(up => up.isRevoked)
    .map(up => up.permission.atom);

  // ⑦ Merge করো — Role permissions + manually granted
  // তারপর revoked গুলো বাদ দাও
  const allPermissions = [...new Set([...rolePermissions, ...grantedPermissions])].filter(
    atom => !revokedPermissions.includes(atom)
  );

  // ⑧ Redis এ cache করো
  await RedisUtils.setCache(`permissions:${userId}`, allPermissions, CACHE_TTL);

  return allPermissions;
};

// Permission cache invalidate করো
// যখন permission grant/revoke হবে তখন call করো
export const invalidatePermissionCache = async (userId: string): Promise<void> => {
  await RedisUtils.deleteCache(`permissions:${userId}`);
};
