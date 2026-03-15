import { StatusCodes } from 'http-status-codes';
import ApiError from '../../utils/ApiError';
import { AuditLogRepository } from '../auditLogs/auditLogs.repository';
import { UserRepository } from '../users/users.repository';
import { PermissionRepository } from './permissions.repository';

const getAllPermissions = async () => {
  // Return all permission atoms
  return PermissionRepository.getAllPermissions();
};

const getMyPermissions = async (userId: string) => {
  // Resolve current user's effective permissions
  return PermissionRepository.resolveUserPermissions(userId);
};

const getUserPermissions = async (userId: string) => {
  // Resolve another user's effective permissions
  return PermissionRepository.resolveUserPermissions(userId);
};

const grantPermission = async (actorId: string, targetUserId: string, permissionId: string) => {
  // Step 1: permission exists check
  const permission = await PermissionRepository.getPermissionById(permissionId);
  if (!permission) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Permission not found.');
  }

  // Step 2: target user exists check
  const targetUserExists = await UserRepository.isUserExists(targetUserId);
  if (!targetUserExists) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Target user not found.');
  }

  // Step 3: grant ceiling check
  const actorPermissions = await PermissionRepository.resolveUserPermissions(actorId);
  const canGrant = actorPermissions.includes(permission.atom);
  if (!canGrant) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'You can only grant permissions that you already have.'
    );
  }

  // Step 4: grant permission
  const granted = await PermissionRepository.grantPermission(actorId, targetUserId, permissionId);

  // Step 5: invalidate target permission cache
  await PermissionRepository.invalidatePermissionCache(targetUserId);

  // Step 6: write audit log
  await AuditLogRepository.createLog({
    actorId,
    action: 'Permission Granted',
    targetType: 'UserPermission',
    targetId: granted.id,
    meta: {
      targetUserId,
      permissionId,
      permissionAtom: permission.atom,
    },
  });

  return granted;
};

const revokePermission = async (actorId: string, targetUserId: string, permissionId: string) => {
  // Step 1: relation exists check
  const existing = await PermissionRepository.findUserPermission(targetUserId, permissionId);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User permission not found.');
  }

  // Step 2: revoke permission
  const revoked = await PermissionRepository.revokePermission(targetUserId, permissionId);

  // Step 3: invalidate target permission cache
  await PermissionRepository.invalidatePermissionCache(targetUserId);

  // Step 4: write audit log
  await AuditLogRepository.createLog({
    actorId,
    action: 'Permission Revoked',
    targetType: 'UserPermission',
    targetId: existing.id,
    meta: {
      targetUserId,
      permissionId,
    },
  });

  return revoked;
};

export const PermissionService = {
  getAllPermissions,
  getMyPermissions,
  getUserPermissions,
  grantPermission,
  revokePermission,
};
