import { LeadStatus } from '../../../prisma/generated/enums';
import { database } from '../../config/database.config';

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

const getAllLeads = async () => {
  return database.lead.findMany({
    select: leadSelect,
    orderBy: { createdAt: 'desc' },
  });
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
