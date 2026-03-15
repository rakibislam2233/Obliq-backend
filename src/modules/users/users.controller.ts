import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import pick from '../../utils/pick.utils';
import sendResponse from '../../utils/sendResponse';
import { UserService } from './users.services';

// ── POST /api/users ────────────────────────────
const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId: actorId } = req.user!;
  const { role: actorRole } = req.user!;
  const user = await UserService.createUser(req.body, actorId, actorRole);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'User created successfully.',
    data: user,
  });
});

// ── GET /api/users ─────────────────────────────
const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const { userId: actorId } = req.user!;
  const { role: actorRole } = req.user!;

  const filters = pick(req.query, [
    'fullName',
    'email',
    'status',
    'roleId',
    'createdById',
    'search',
  ]);
  const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);

  const result = await UserService.getAllUsers(actorId, actorRole, filters, options);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Users fetched successfully.',
    data: result,
  });
});

// ── GET /api/users/:id ─────────────────────────
const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id: userId } = req.params;
  const user = await UserService.getUserById(userId as string);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User fetched successfully.',
    data: user,
  });
});

// ── PATCH /api/users/:id ───────────────────────
const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id: userId } = req.params;
  const { userId: actorId } = req.user!;
  const user = await UserService.updateUser(userId as string, req.body, actorId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User updated successfully.',
    data: user,
  });
});

// ── PATCH /api/users/:id/status ────────────────
const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id: userId } = req.params;
  const { userId: actorId } = req.user!;
  const { status } = req.body;
  const user = await UserService.updateUserStatus(userId as string, status, actorId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User status updated successfully.',
    data: user,
  });
});

// ── DELETE /api/users/:id ──────────────────────
const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId: actorId } = req.user!;
  const { id: userId } = req.params;
  await UserService.deleteUser(userId as string, actorId);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User deleted successfully.',
  });
});

export const UserController = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
};
