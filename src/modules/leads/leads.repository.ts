import { LeadStatus } from '../../../prisma/generated/enums';
import { database } from '../../config/database.config';
import {
  createPaginationQuery,
  createPaginationResult,
  PaginationOptions,
  PaginationResult,
  parsePaginationOptions,
} from '../../utils/pagination.utils';
import { ILeadFilters } from './leads.interface';

const leadSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  company: true,
  source: true,
  notes: true,
  status: true,
  assignedToId: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
};

const getAllLeads = async (
  filters: ILeadFilters,
  options: PaginationOptions
): Promise<PaginationResult<any>> => {
  const pagination = parsePaginationOptions(options);
  const { skip, take, orderBy } = createPaginationQuery(pagination);

  const where: any = {};

  if (filters.search) {
    where.OR = [
      { fullName: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
      { phone: { contains: filters.search, mode: 'insensitive' } },
      { company: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.fullName) {
    where.fullName = { contains: filters.fullName, mode: 'insensitive' };
  }
  if (filters.email) {
    where.email = { contains: filters.email, mode: 'insensitive' };
  }
  if (filters.source) {
    where.source = { contains: filters.source, mode: 'insensitive' };
  }
  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.assignedToId) {
    where.assignedToId = filters.assignedToId;
  }

  const [leads, total] = await Promise.all([
    database.lead.findMany({
      where,
      select: leadSelect,
      skip,
      take,
      orderBy,
    }),
    database.lead.count({ where }),
  ]);

  return createPaginationResult(leads, total, pagination);
};

const getLeadById = async (id: string) => {
  return database.lead.findUnique({
    where: { id },
    select: leadSelect,
  });
};

const createLead = async (payload: {
  fullName: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: string;
  notes?: string;
  assignedToId?: string;
  createdById: string;
}) => {
  return database.lead.create({
    data: payload,
    select: leadSelect,
  });
};

const updateLead = async (
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
  return database.lead.update({
    where: { id },
    data: payload,
    select: leadSelect,
  });
};

const updateLeadStatus = async (id: string, status: LeadStatus) => {
  return database.lead.update({
    where: { id },
    data: { status },
    select: leadSelect,
  });
};

const deleteLead = async (id: string) => {
  return database.lead.delete({
    where: { id },
    select: { id: true },
  });
};

export const LeadRepository = {
  getAllLeads,
  getLeadById,
  createLead,
  updateLead,
  updateLeadStatus,
  deleteLead,
};
