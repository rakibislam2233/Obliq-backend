import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../utils/sendResponse';
import { PermissionService } from './permissions.service';

// GET /api/v1/permissions
const getAllPermissions = asyncHandler(async (_req: Request, res: Response) => {
  const permissions = await PermissionService.getAllPermissions();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Permissions fetched successfully.',
    data: permissions,
  });
});

// GET /api/v1/permissions/me
const getMyPermissions = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const permissions = await PermissionService.getMyPermissions(userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'My permissions fetched successfully.',
    data: permissions,
  });
});

// GET /api/v1/permissions/users/:userId
const getUserPermissions = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const permissions = await PermissionService.getUserPermissions(userId as string);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User permissions fetched successfully.',
    data: permissions,
  });
});

// POST /api/v1/permissions/user/:userId/grant
const grantPermission = asyncHandler(async (req: Request, res: Response) => {
  const { userId: actorId } = req.user!;
  const { userId: targetUserId } = req.params;
  const { permissionId } = req.body;

  const granted = await PermissionService.grantPermission(
    actorId,
    targetUserId as string,
    permissionId
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Permission granted successfully.',
    data: granted,
  });
});

// POST /api/v1/permissions/user/:userId/revoke
const revokePermission = asyncHandler(async (req: Request, res: Response) => {
  const { userId: actorId } = req.user!;
  const { userId: targetUserId } = req.params;
  const { permissionId } = req.body;

  const revoked = await PermissionService.revokePermission(
    actorId,
    targetUserId as string,
    permissionId
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Permission revoked successfully.',
    data: revoked,
  });
});

// POST /api/v1/permissions
const createPermission = asyncHandler(async (req: Request, res: Response) => {
  const { userId: actorId } = req.user!;
  const permission = await PermissionService.createPermission(actorId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Permission created successfully.',
    data: permission,
  });
});

// DELETE /api/v1/permissions/:permissionId
const deletePermission = asyncHandler(async (req: Request, res: Response) => {
  const { userId: actorId } = req.user!;
  const { permissionId } = req.params;

  const permission = await PermissionService.deletePermission(actorId, permissionId as string);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Permission deleted successfully.',
    data: permission,
  });
});

export const PermissionController = {
  getAllPermissions,
  getMyPermissions,
  getUserPermissions,
  grantPermission,
  revokePermission,
  createPermission,
  deletePermission,
};
