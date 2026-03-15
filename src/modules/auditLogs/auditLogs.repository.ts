import type { Prisma } from '../../../prisma/generated/client';
import { database } from '../../config/database.config';
import logger from '../../utils/logger';
import {
  createPaginationQuery,
  createPaginationResult,
  PaginationOptions,
  parsePaginationOptions,
} from '../../utils/pagination.utils';
import { IAuditFilters, ICreateAuditLog } from './auditLogs.interface';

// ── Create Audit Log ───────────────────────────
const createLog = async (data: ICreateAuditLog): Promise<void> => {
  try {
    await database.auditLog.create({
      data: {
        actorId: data.actorId,
        action: data.action,
        targetType: data.targetType,
        targetId: data.targetId,
        meta: (data.meta ?? {}) as Prisma.InputJsonValue,
      },
    });
  } catch (err) {
    logger.warn(`Audit log failed [${data.action}]:`, err);
  }
};

// ── Get All Logs with Filters + Pagination ─────
const getAllLogs = async (filters: IAuditFilters, options: PaginationOptions) => {
  const pagination = parsePaginationOptions(options);
  const { skip, take, orderBy } = createPaginationQuery(pagination);

  const where: any = {};

  if (filters.actorId) where.actorId = filters.actorId;
  if (filters.action) where.action = filters.action;
  if (filters.targetType) where.targetType = filters.targetType;
  if (filters.targetId) where.targetId = filters.targetId;

  // Date range filter
  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
    if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
  }

  const [logs, total] = await Promise.all([
    database.auditLog.findMany({
      where,
      select: {
        id: true,
        action: true,
        targetType: true,
        targetId: true,
        meta: true,
        createdAt: true,
        actor: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      skip,
      take,
      orderBy: orderBy ?? { createdAt: 'desc' },
    }),
    database.auditLog.count({ where }),
  ]);

  return createPaginationResult(logs, total, pagination);
};

// -- Get User Logs (Optional) ───────────────────────────
const getUserLogs = async (userId: string, options: PaginationOptions) => {
  const pagination = parsePaginationOptions(options);
  const { skip, take, orderBy } = createPaginationQuery(pagination);

  const [logs, total] = await Promise.all([
    database.auditLog.findMany({
      where: { actorId: userId },
      select: {
        id: true,
        action: true,
        targetType: true,
        targetId: true,
        meta: true,
        createdAt: true,
        actor: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      skip,
      take,
      orderBy: orderBy ?? { createdAt: 'desc' },
    }),
    database.auditLog.count({ where: { actorId: userId } }),
  ]);
  return createPaginationResult(logs, total, pagination);
};

export const AuditLogRepository = {
  createLog,
  getAllLogs,
  getUserLogs,
};
