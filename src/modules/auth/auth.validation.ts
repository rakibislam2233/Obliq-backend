import { z } from 'zod';

const login = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

const refresh = z
  .object({
    body: z
      .object({
        refreshToken: z.string().min(1, 'Refresh token is required').optional(),
      })
      .optional(),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
    cookies: z
      .object({
        refreshToken: z.string().min(1, 'Refresh token is required').optional(),
      })
      .optional(),
  })
  .refine(
    data => Boolean(data.body?.refreshToken || data.cookies?.refreshToken),
    'Refresh token is required in cookie or request body'
  );

const logout = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

const forgotPassword = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

const resetPassword = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

const changePassword = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

export const AuthValidation = {
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
};
