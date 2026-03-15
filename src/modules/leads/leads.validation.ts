import { z } from 'zod';
import { LeadStatus } from '../../../prisma/generated/enums';

const idParamSchema = z.object({
  id: z.string().min(1, 'Lead id is required'),
});

const getAllLeads = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    fullName: z.string().optional(),
    email: z.string().optional(),
    source: z.string().optional(),
    status: z.enum(Object.values(LeadStatus) as [string, ...string[]]).optional(),
    assignedToId: z.string().optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
  cookies: z.object({}).optional(),
});

const getLeadById = z.object({
  body: z.object({}).optional(),
  params: idParamSchema,
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

const createLead = z.object({
  body: z.object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().optional(),
    company: z.string().optional(),
    source: z.string().optional(),
    notes: z.string().optional(),
    assignedToId: z.string().optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

const updateLead = z.object({
  body: z
    .object({
      fullName: z.string().min(1).optional(),
      email: z.string().email('Invalid email address').optional(),
      phone: z.string().optional(),
      company: z.string().optional(),
      source: z.string().optional(),
      notes: z.string().optional(),
      assignedToId: z.string().optional(),
    })
    .refine(value => Object.keys(value).length > 0, {
      message: 'At least one field is required to update lead',
    }),
  params: idParamSchema,
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

const updateLeadStatus = z.object({
  body: z.object({
    status: z.enum(Object.values(LeadStatus) as [string, ...string[]]),
  }),
  params: idParamSchema,
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

const deleteLead = z.object({
  body: z.object({}).optional(),
  params: idParamSchema,
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

export const LeadValidation = {
  getAllLeads,
  getLeadById,
  createLead,
  updateLead,
  updateLeadStatus,
  deleteLead,
};
