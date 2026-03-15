import { z } from 'zod';
import { UserStatus } from '../../../prisma/generated/enums';

const idParamSchema = z.object({
  id: z.string().min(1, 'Customer id is required'),
});

const getAllCustomers = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    fullName: z.string().optional(),
    email: z.string().optional(),
    status: z.enum(Object.values(UserStatus) as [string, ...string[]]).optional(),
    createdById: z.string().optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
  cookies: z.object({}).optional(),
});

const getCustomerById = z.object({
  body: z.object({}).optional(),
  params: idParamSchema,
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

const createCustomer = z.object({
  body: z.object({
    fullName: z.string().min(1, 'Full name is required').max(120),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

const updateCustomer = z.object({
  body: z
    .object({
      fullName: z.string().min(1).max(120).optional(),
      email: z.string().email('Invalid email address').optional(),
    })
    .refine(value => Object.keys(value).length > 0, {
      message: 'At least one field is required to update customer',
    }),
  params: idParamSchema,
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

const updateCustomerStatus = z.object({
  body: z.object({
    status: z.enum(Object.values(UserStatus) as [string, ...string[]]),
  }),
  params: idParamSchema,
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

const deleteCustomer = z.object({
  body: z.object({}).optional(),
  params: idParamSchema,
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

export const CustomerValidation = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  updateCustomerStatus,
  deleteCustomer,
};
