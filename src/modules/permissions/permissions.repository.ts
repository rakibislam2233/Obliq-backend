import { database } from '../../config/database.config';
import { RedisUtils } from '../../utils/redis.utils';

const permissionSelect = {
  id: true,
  atom: true,
  description: true,
  module: true,
};

const getAllPermissions = async () => {
  // Fetch all permission atoms
  return database.permission.findMany({
    select: permissionSelect,
    orderBy: { module: 'asc' },
  });
};

const getPermissionById = async (permissionId: string) => {
  // Find a permission by id
  return database.permission.findUnique({
    where: { id: permissionId },
    select: permissionSelect,
  });
};

const findUserPermission = async (userId: string, permissionId: string) => {
  // Check user-permission relation
  return database.userPermission.findUnique({
    where: {
      userId_permissionId: {
        userId,
        permissionId,
      },
    },
    select: {
      id: true,
      userId: true,
      permissionId: true,
      grantedById: true,
      isRevoked: true,
      createdAt: true,
    },
  });
};

const grantPermission = async (actorId: string, targetUserId: string, permissionId: string) => {
  // Create or re-activate user permission
  return database.userPermission.upsert({
    where: {
      userId_permissionId: {
        userId: targetUserId,
        permissionId,
      },
    },
    create: {
      userId: targetUserId,
      permissionId,
      grantedById: actorId,
      isRevoked: false,
    },
    update: {
      grantedById: actorId,
      isRevoked: false,
    },
    select: {
      id: true,
      userId: true,
      permissionId: true,
      grantedById: true,
      isRevoked: true,
      createdAt: true,
    },
  });
};

const revokePermission = async (targetUserId: string, permissionId: string) => {
  // Mark permission as revoked
  return database.userPermission.update({
    where: {
      userId_permissionId: {
        userId: targetUserId,
        permissionId,
      },
    },
    data: {
      isRevoked: true,
    },
    select: {
      id: true,
      userId: true,
      permissionId: true,
      grantedById: true,
      isRevoked: true,
      createdAt: true,
    },
  });
};

const resolveUserPermissions = async (userId: string): Promise<string[]> => {
  // Check cache first
  const cached = await RedisUtils.getCache<string[]>(`permissions:${userId}`);
  if (cached) return cached;

  // Load role and user-level permissions
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

  // Build effective permissions
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

  // Cache for 5 minutes
  await RedisUtils.setCache(`permissions:${userId}`, allPermissions, 60 * 5);
  return allPermissions;
};

const invalidatePermissionCache = async (userId: string): Promise<void> => {
  // Clear permission cache for a user
  await RedisUtils.deleteCache(`permissions:${userId}`);
};

export const PermissionRepository = {
  getAllPermissions,
  getPermissionById,
  findUserPermission,
  grantPermission,
  revokePermission,
  resolveUserPermissions,
  invalidatePermissionCache,
};
