import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../utils/sendResponse';
import { SettingService } from './settings.service';

const getAllSettings = asyncHandler(async (_req: Request, res: Response) => {
  const result = await SettingService.getAllSettings();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Settings fetched successfully.',
    data: result,
  });
});

const getSettingByKey = asyncHandler(async (req: Request, res: Response) => {
  const result = await SettingService.getSettingByKey(req.params.key as string);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Setting fetched successfully.',
    data: result,
  });
});

const upsertSetting = asyncHandler(async (req: Request, res: Response) => {
  const result = await SettingService.upsertSetting(req.user!.userId, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Setting saved successfully.',
    data: result,
  });
});

const deleteSetting = asyncHandler(async (req: Request, res: Response) => {
  const result = await SettingService.deleteSetting(req.user!.userId, req.params.key as string);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Setting deleted successfully.',
    data: result,
  });
});

export const SettingController = {
  getAllSettings,
  getSettingByKey,
  upsertSetting,
  deleteSetting,
};
