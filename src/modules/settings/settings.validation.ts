import { z } from 'zod';

const keyParamSchema = z.object({
  key: z.string().min(1, 'Setting key is required'),
});

const getAllSettings = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

const getSettingByKey = z.object({
  body: z.object({}).optional(),
  params: keyParamSchema,
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

const upsertSetting = z.object({
  body: z.object({
    key: z.string().min(1, 'Setting key is required'),
    value: z.unknown(),
    description: z.string().optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

const deleteSetting = z.object({
  body: z.object({}).optional(),
  params: keyParamSchema,
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

export const SettingValidation = {
  getAllSettings,
  getSettingByKey,
  upsertSetting,
  deleteSetting,
};
