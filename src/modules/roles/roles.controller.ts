import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../utils/sendResponse';
import { RoleService } from './roles.service';

// GET /api/v1/roles
const getAllRoles = asyncHandler(async (_req: Request, res: Response) => {
  const roles = await RoleService.getAllRoles();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Roles fetched successfully.',
    data: roles,
  });
});

// GET /api/v1/roles/:id/permissions
const getRolePermissions = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const role = await RoleService.getRolePermissions(id as string);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Role permissions fetched successfully.',
    data: role,
  });
});

// PATCH /api/v1/roles/:id/permissions
const updateRolePermissions = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { permissionIds } = req.body;
  const { userId: actorId } = req.user!;

  const role = await RoleService.updateRolePermissions(id as string, permissionIds, actorId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Role permissions updated successfully.',
    data: role,
  });
});

export const RoleController = {
  getAllRoles,
  getRolePermissions,
  updateRolePermissions,
};
