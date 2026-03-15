import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import pick from '../../utils/pick.utils';
import sendResponse from '../../utils/sendResponse';
import { CustomerService } from './customers.service';

const getAllCustomers = asyncHandler(async (req: Request, res: Response) => {
  const { userId: actorId, role: actorRole } = req.user!;
  const filters = pick(req.query, ['fullName', 'email', 'status', 'createdById', 'search']);
  const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);

  const result = await CustomerService.getAllCustomers(actorId, actorRole, filters, options);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Customers fetched successfully.',
    data: result,
  });
});

const getCustomerById = asyncHandler(async (req: Request, res: Response) => {
  const result = await CustomerService.getCustomerById(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Customer fetched successfully.',
    data: result,
  });
});

const createCustomer = asyncHandler(async (req: Request, res: Response) => {
  const result = await CustomerService.createCustomer(req.body, req.user!.userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Customer created successfully.',
    data: result,
  });
});

const updateCustomer = asyncHandler(async (req: Request, res: Response) => {
  const result = await CustomerService.updateCustomer(
    req.params.id as string,
    req.body,
    req.user!.userId
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Customer updated successfully.',
    data: result,
  });
});

const updateCustomerStatus = asyncHandler(async (req: Request, res: Response) => {
  const result = await CustomerService.updateCustomerStatus(
    req.params.id as string,
    req.body.status,
    req.user!.userId
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Customer status updated successfully.',
    data: result,
  });
});

const deleteCustomer = asyncHandler(async (req: Request, res: Response) => {
  await CustomerService.deleteCustomer(req.params.id as string, req.user!.userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Customer deleted successfully.',
  });
});

export const CustomerController = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  updateCustomerStatus,
  deleteCustomer,
};
