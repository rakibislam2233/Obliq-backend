import { Request } from 'express';
import { AuditLogService } from '../modules/auditLog/auditLog.service';

export const createAuditLog = async (
  userId: string | undefined,
  action: AuditAction,
  entity: string,
  entityId?: string,
  metadata?: Record<string, unknown>,
  req?: Request
) => {
  await AuditLogService.createAuditLog({
    userId,
    action: action as string,
    entity,
    entityId,
    metadata,
    ipAddress: req?.ip,
    userAgent: req?.get('User-Agent'),
  });
};
