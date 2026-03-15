import { StatusCodes } from 'http-status-codes';
import ApiError from '../../utils/ApiError';
import { AuditLogRepository } from '../auditLogs/auditLogs.repository';
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

const updateRolePermissions = async (roleId: string, permissionIds: string[], actorId: string) => {
  const role = await RoleRepository.getRolePermissions(roleId);
  if (!role) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Role not found.');
  }

  const uniquePermissionIds = [...new Set(permissionIds)];
  const existingPermissionIds = await RoleRepository.getPermissionIds(uniquePermissionIds);

  if (existingPermissionIds.length !== uniquePermissionIds.length) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'One or more permission ids are invalid.');
  }

  const updatedRole = await RoleRepository.replaceRolePermissions(roleId, uniquePermissionIds);

  await AuditLogRepository.createLog({
    actorId,
    action: 'Role Permissions Updated',
    targetType: 'Role',
    targetId: roleId,
    meta: {
      permissionIds: uniquePermissionIds,
    },
  });

  return {
    id: updatedRole!.id,
    name: updatedRole!.name,
    permissions: updatedRole!.rolePermissions.map(item => item.permission),
  };
};

export const RoleService = {
  getAllRoles,
  getRolePermissions,
  updateRolePermissions,
};
