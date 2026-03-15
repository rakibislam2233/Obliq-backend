import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../utils/sendResponse';
import { LeadService } from './leads.service';

const getAllLeads = asyncHandler(async (_req: Request, res: Response) => {
  const result = await LeadService.getAllLeads();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Leads fetched successfully.',
    data: result,
  });
});

const getLeadById = asyncHandler(async (req: Request, res: Response) => {
  const result = await LeadService.getLeadById(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Lead fetched successfully.',
    data: result,
  });
});

const createLead = asyncHandler(async (req: Request, res: Response) => {
  const result = await LeadService.createLead(req.user!.userId, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Lead created successfully.',
    data: result,
  });
});

const updateLead = asyncHandler(async (req: Request, res: Response) => {
  const result = await LeadService.updateLead(req.user!.userId, req.params.id as string, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Lead updated successfully.',
    data: result,
  });
});

const updateLeadStatus = asyncHandler(async (req: Request, res: Response) => {
  const result = await LeadService.updateLeadStatus(
    req.user!.userId,
    req.params.id as string,
    req.body.status
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Lead status updated successfully.',
    data: result,
  });
});

const deleteLead = asyncHandler(async (req: Request, res: Response) => {
  await LeadService.deleteLead(req.user!.userId, req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Lead deleted successfully.',
  });
});

export const LeadController = {
  getAllLeads,
  getLeadById,
  createLead,
  updateLead,
  updateLeadStatus,
  deleteLead,
};
