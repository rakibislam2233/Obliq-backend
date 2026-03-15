import { LeadStatus, TaskStatus, UserStatus } from '../../../prisma/generated/enums';
import { database } from '../../config/database.config';

const getSummary = async () => {
  const [users, customers, leads, tasks, auditLogs] = await Promise.all([
    database.user.count(),
    database.user.count({ where: { role: { name: 'CUSTOMER' } } }),
    database.lead.count(),
    database.task.count(),
    database.auditLog.count(),
  ]);

  return {
    users,
    customers,
    leads,
    tasks,
    auditLogs,
  };
};

const getLeadStatusReport = async () => {
  const [newCount, contacted, qualified, converted, lost] = await Promise.all([
    database.lead.count({ where: { status: LeadStatus.NEW } }),
    database.lead.count({ where: { status: LeadStatus.CONTACTED } }),
    database.lead.count({ where: { status: LeadStatus.QUALIFIED } }),
    database.lead.count({ where: { status: LeadStatus.CONVERTED } }),
    database.lead.count({ where: { status: LeadStatus.LOST } }),
  ]);

  return {
    NEW: newCount,
    CONTACTED: contacted,
    QUALIFIED: qualified,
    CONVERTED: converted,
    LOST: lost,
  };
};

const getTaskStatusReport = async () => {
  const [todo, inProgress, done, cancelled] = await Promise.all([
    database.task.count({ where: { status: TaskStatus.TODO } }),
    database.task.count({ where: { status: TaskStatus.IN_PROGRESS } }),
    database.task.count({ where: { status: TaskStatus.DONE } }),
    database.task.count({ where: { status: TaskStatus.CANCELLED } }),
  ]);

  return {
    TODO: todo,
    IN_PROGRESS: inProgress,
    DONE: done,
    CANCELLED: cancelled,
  };
};

const getUserStatusReport = async () => {
  const [active, suspended, banned] = await Promise.all([
    database.user.count({ where: { status: UserStatus.ACTIVE } }),
    database.user.count({ where: { status: UserStatus.SUSPENDED } }),
    database.user.count({ where: { status: UserStatus.BANNED } }),
  ]);

  return {
    ACTIVE: active,
    SUSPENDED: suspended,
    BANNED: banned,
  };
};

export const ReportRepository = {
  getSummary,
  getLeadStatusReport,
  getTaskStatusReport,
  getUserStatusReport,
};
