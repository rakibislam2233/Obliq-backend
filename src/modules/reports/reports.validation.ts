import { z } from 'zod';

const reportRequest = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

export const ReportValidation = {
  getSummary: reportRequest,
  getLeadStatusReport: reportRequest,
  getTaskStatusReport: reportRequest,
  getUserStatusReport: reportRequest,
};
