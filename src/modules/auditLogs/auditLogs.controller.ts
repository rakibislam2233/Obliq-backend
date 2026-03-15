import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import pick from '../../utils/pick.utils';
import { AuditLogServices } from './auditLogs.services';
import sendResponse from '../../utils/sendResponse';

// ── GET /api/audit ─────────────────────────────
const getAllLogs = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, [
    'actorId',
    'action',
    'targetType',
    'targetId',
    'startDate',
    'endDate',
  ]);

  const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);

  const result = await AuditLogServices.getAllLogs(filters, options);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Audit logs retrieved successfully.',
    data: result,
  });
});
// ── GET /api/audit/user/:userId ─────────────────────────────
const getUserLogs = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const filters = pick(req.query, ['action', 'targetType', 'targetId', 'startDate', 'endDate']);
  const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
  const result = await AuditLogServices.getUserLogs(userId as string, filters, options);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User audit logs retrieved successfully.',
    data: result,
  });
});

export const AuditController = {
  getAllLogs,
  getUserLogs,
};
