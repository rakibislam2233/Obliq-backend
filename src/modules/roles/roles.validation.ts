import { z } from 'zod';

const idParamSchema = z.object({
  id: z.string().min(1, 'Role id is required'),
});

const getAllRoles = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

const getRolePermissions = z.object({
  body: z.object({}).optional(),
  params: idParamSchema,
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

const updateRolePermissions = z.object({
  body: z.object({
    permissionIds: z.array(z.string().min(1, 'Permission id is required')),
  }),
  params: idParamSchema,
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

export const RoleValidation = {
  getAllRoles,
  getRolePermissions,
  updateRolePermissions,
};
