import { database } from '../../config/database.config';

const roleSelect = {
  id: true,
  name: true,
};

const permissionSelect = {
  id: true,
  atom: true,
  description: true,
  module: true,
};

const getAllRoles = async () => {
  return database.role.findMany({
    select: roleSelect,
    orderBy: { name: 'asc' },
  });
};

const getRolePermissions = async (roleId: string) => {
  return database.role.findUnique({
    where: { id: roleId },
    select: {
      ...roleSelect,
      rolePermissions: {
        select: {
          permission: {
            select: permissionSelect,
          },
        },
      },
    },
  });
};

const getPermissionIds = async (permissionIds: string[]) => {
  if (permissionIds.length === 0) {
    return [] as string[];
  }

  const permissions = await database.permission.findMany({
    where: { id: { in: permissionIds } },
    select: { id: true },
  });

  return permissions.map(permission => permission.id);
};

const replaceRolePermissions = async (roleId: string, permissionIds: string[]) => {
  await database.$transaction(async tx => {
    await tx.rolePermission.deleteMany({ where: { roleId } });

    if (permissionIds.length > 0) {
      await tx.rolePermission.createMany({
        data: permissionIds.map(permissionId => ({ roleId, permissionId })),
        skipDuplicates: true,
      });
    }
  });

  return getRolePermissions(roleId);
};

export const RoleRepository = {
  getAllRoles,
  getRolePermissions,
  getPermissionIds,
  replaceRolePermissions,
};
