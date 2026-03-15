import { z } from 'zod';

const userIdParamSchema = z.object({
  userId: z.string().min(1, 'User id is required'),
});

const getAllPermissions = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

const getMyPermissions = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

const getUserPermissions = z.object({
  body: z.object({}).optional(),
  params: userIdParamSchema,
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

const grantPermission = z.object({
  body: z.object({
    permissionId: z.string().min(1, 'Permission id is required'),
  }),
  params: userIdParamSchema,
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

const revokePermission = z.object({
  body: z.object({
    permissionId: z.string().min(1, 'Permission id is required'),
  }),
  params: userIdParamSchema,
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

export const PermissionValidation = {
  getAllPermissions,
  getMyPermissions,
  getUserPermissions,
  grantPermission,
  revokePermission,
};
