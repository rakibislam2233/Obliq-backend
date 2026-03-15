import { database } from '../../config/database.config';

const settingSelect = {
  id: true,
  key: true,
  value: true,
  description: true,
  createdAt: true,
  updatedAt: true,
};

const getAllSettings = async () => {
  return database.setting.findMany({
    select: settingSelect,
    orderBy: { key: 'asc' },
  });
};

const getSettingByKey = async (key: string) => {
  return database.setting.findUnique({
    where: { key },
    select: settingSelect,
  });
};

const upsertSetting = async (payload: { key: string; value: unknown; description?: string }) => {
  return database.setting.upsert({
    where: { key: payload.key },
    create: {
      key: payload.key,
      value: payload.value as any,
      description: payload.description,
    },
    update: {
      value: payload.value as any,
      description: payload.description,
    },
    select: settingSelect,
  });
};

const deleteSetting = async (key: string) => {
  return database.setting.delete({
    where: { key },
    select: settingSelect,
  });
};

export const SettingRepository = {
  getAllSettings,
  getSettingByKey,
  upsertSetting,
  deleteSetting,
};
