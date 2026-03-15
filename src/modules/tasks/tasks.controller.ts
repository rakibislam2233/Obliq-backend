import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../utils/sendResponse';
import { TaskService } from './tasks.service';

const getAllTasks = asyncHandler(async (_req: Request, res: Response) => {
  const result = await TaskService.getAllTasks();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Tasks fetched successfully.',
    data: result,
  });
});

const getTaskById = asyncHandler(async (req: Request, res: Response) => {
  const result = await TaskService.getTaskById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Task fetched successfully.',
    data: result,
  });
});

const createTask = asyncHandler(async (req: Request, res: Response) => {
  const result = await TaskService.createTask(req.user!.userId, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Task created successfully.',
    data: result,
  });
});

const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const result = await TaskService.updateTask(req.user!.userId, req.params.id as string, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Task updated successfully.',
    data: result,
  });
});

const updateTaskStatus = asyncHandler(async (req: Request, res: Response) => {
  const result = await TaskService.updateTaskStatus(
    req.user!.userId,
    req.params.id as string,
    req.body.status
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Task status updated successfully.',
    data: result,
  });
});

const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  await TaskService.deleteTask(req.user!.userId, req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Task deleted successfully.',
  });
});

export const TaskController = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
