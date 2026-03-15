import { LeadStatus } from '../../../prisma/generated/enums';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../utils/ApiError';
import { PaginationOptions } from '../../utils/pagination.utils';
import { AuditLogRepository } from '../auditLogs/auditLogs.repository';
import { ILeadFilters } from './leads.interface';
import { LeadRepository } from './leads.repository';

const getAllLeads = async (filters: ILeadFilters, options: PaginationOptions) => {
  return LeadRepository.getAllLeads(filters, options);
};

const getLeadById = async (id: string) => {
  const lead = await LeadRepository.getLeadById(id);
  if (!lead) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Lead not found.');
  }
  return lead;
};

const createLead = async (
  actorId: string,
  payload: {
    fullName: string;
    email?: string;
    phone?: string;
    company?: string;
    source?: string;
    notes?: string;
    assignedToId?: string;
  }
) => {
  const created = await LeadRepository.createLead({
    ...payload,
    createdById: actorId,
  });

  await AuditLogRepository.createLog({
    actorId,
    action: 'Lead Created',
    targetType: 'Lead',
    targetId: created.id,
  });

  return created;
};

const updateLead = async (
  actorId: string,
  id: string,
  payload: {
    fullName?: string;
    email?: string;
    phone?: string;
    company?: string;
    source?: string;
    notes?: string;
    assignedToId?: string;
  }
) => {
  const existing = await LeadRepository.getLeadById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Lead not found.');
  }

  const updated = await LeadRepository.updateLead(id, payload);

  await AuditLogRepository.createLog({
    actorId,
    action: 'Lead Updated',
    targetType: 'Lead',
    targetId: id,
    meta: { updatedFields: Object.keys(payload) },
  });

  return updated;
};

const updateLeadStatus = async (actorId: string, id: string, status: LeadStatus) => {
  const existing = await LeadRepository.getLeadById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Lead not found.');
  }

  const updated = await LeadRepository.updateLeadStatus(id, status);

  await AuditLogRepository.createLog({
    actorId,
    action: `Lead Status Updated To ${status}`,
    targetType: 'Lead',
    targetId: id,
  });

  return updated;
};

const deleteLead = async (actorId: string, id: string) => {
  const existing = await LeadRepository.getLeadById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Lead not found.');
  }

  await LeadRepository.deleteLead(id);

  await AuditLogRepository.createLog({
    actorId,
    action: 'Lead Deleted',
    targetType: 'Lead',
    targetId: id,
  });
};

export const LeadService = {
  getAllLeads,
  getLeadById,
  createLead,
  updateLead,
  updateLeadStatus,
  deleteLead,
};
