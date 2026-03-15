import { StatusCodes } from 'http-status-codes';
import ApiError from '../../utils/ApiError';
import { AuditLogRepository } from '../auditLogs/auditLogs.repository';
import { SettingRepository } from './settings.repository';

const getAllSettings = async () => {
  return SettingRepository.getAllSettings();
};

const getSettingByKey = async (key: string) => {
  const setting = await SettingRepository.getSettingByKey(key);
  if (!setting) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Setting not found.');
  }
  return setting;
};

const upsertSetting = async (
  actorId: string,
  payload: { key: string; value: unknown; description?: string }
) => {
  const setting = await SettingRepository.upsertSetting(payload);

  await AuditLogRepository.createLog({
    actorId,
    action: 'Setting Upserted',
    targetType: 'Setting',
    targetId: setting.id,
    meta: { key: setting.key },
  });

  return setting;
};

const deleteSetting = async (actorId: string, key: string) => {
  const existing = await SettingRepository.getSettingByKey(key);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Setting not found.');
  }

  const deleted = await SettingRepository.deleteSetting(key);

  await AuditLogRepository.createLog({
    actorId,
    action: 'Setting Deleted',
    targetType: 'Setting',
    targetId: deleted.id,
    meta: { key: deleted.key },
  });

  return deleted;
};

export const SettingService = {
  getAllSettings,
  getSettingByKey,
  upsertSetting,
  deleteSetting,
};
