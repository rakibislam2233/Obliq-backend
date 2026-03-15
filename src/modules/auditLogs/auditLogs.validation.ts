import { z } from 'zod';

const userIdParamSchema = z.object({
  userId: z.string().min(1, 'User id is required'),
});

const getAllLogs = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    actorId: z.string().optional(),
    action: z.string().optional(),
    targetType: z.string().optional(),
    targetId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
  cookies: z.object({}).optional(),
});

const getUserLogs = z.object({
  body: z.object({}).optional(),
  params: userIdParamSchema,
  query: z.object({
    action: z.string().optional(),
    targetType: z.string().optional(),
    targetId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
  cookies: z.object({}).optional(),
});

export const AuditValidation = {
  getAllLogs,
  getUserLogs,
};