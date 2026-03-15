import { StatusCodes } from 'http-status-codes';
import ApiError from '../../utils/ApiError';
import { RoleRepository } from './roles.repository';

const getAllRoles = async () => {
  return RoleRepository.getAllRoles();
};

const getRolePermissions = async (roleId: string) => {
  const role = await RoleRepository.getRolePermissions(roleId);

  if (!role) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Role not found.');
  }

  return {
    id: role.id,
    name: role.name,
    permissions: role.rolePermissions.map(item => item.permission),
  };
};

export const RoleService = {
  getAllRoles,
  getRolePermissions,
};
