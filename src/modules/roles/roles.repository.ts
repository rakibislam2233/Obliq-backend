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

export const RoleRepository = {
  getAllRoles,
  getRolePermissions,
};
