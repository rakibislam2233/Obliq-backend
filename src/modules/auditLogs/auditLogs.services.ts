import { PaginationOptions } from '../../utils/pagination.utils';
import { IAuditFilters, ICreateAuditLog } from './auditLogs.interface';
import { AuditLogRepository } from './auditLogs.repository';

const createLog = async (data: ICreateAuditLog) => {
  const result = await AuditLogRepository.createLog(data);
  return result;
};

const getAllLogs = async (filters: IAuditFilters, options: PaginationOptions) => {
  const result = await AuditLogRepository.getAllLogs(filters, options);
  return result;
};

const getUserLogs = async (userId: string, filters: IAuditFilters, options: PaginationOptions) => {
  const userFilters = { ...filters, actorId: userId };
  const result = await AuditLogRepository.getAllLogs(userFilters, options);
  return result;
};

export const AuditLogServices = {
  createLog,
  getAllLogs,
  getUserLogs,
};
