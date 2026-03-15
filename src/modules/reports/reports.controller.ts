import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../utils/sendResponse';
import { ReportService } from './reports.service';

const getSummary = asyncHandler(async (_req: Request, res: Response) => {
  const result = await ReportService.getSummary();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Summary report fetched successfully.',
    data: result,
  });
});

const getLeadStatusReport = asyncHandler(async (_req: Request, res: Response) => {
  const result = await ReportService.getLeadStatusReport();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Lead status report fetched successfully.',
    data: result,
  });
});

const getTaskStatusReport = asyncHandler(async (_req: Request, res: Response) => {
  const result = await ReportService.getTaskStatusReport();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Task status report fetched successfully.',
    data: result,
  });
});

const getUserStatusReport = asyncHandler(async (_req: Request, res: Response) => {
  const result = await ReportService.getUserStatusReport();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User status report fetched successfully.',
    data: result,
  });
});

export const ReportController = {
  getSummary,
  getLeadStatusReport,
  getTaskStatusReport,
  getUserStatusReport,
};
