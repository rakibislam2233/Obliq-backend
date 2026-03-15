import { TaskStatus } from '../../../prisma/generated/enums';
import { database } from '../../config/database.config';
import {
  createPaginationQuery,
  createPaginationResult,
  PaginationOptions,
  PaginationResult,
  parsePaginationOptions,
} from '../../utils/pagination.utils';
import { ITaskFilters } from './tasks.interface';

const taskSelect = {
  id: true,
  title: true,
  description: true,
  dueDate: true,
  status: true,
  leadId: true,
  assignedToId: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
};

const getAllTasks = async (
  filters: ITaskFilters,
  options: PaginationOptions
): Promise<PaginationResult<any>> => {
  const pagination = parsePaginationOptions(options);
  const { skip, take, orderBy } = createPaginationQuery(pagination);

  const where: any = {};

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.title) {
    where.title = { contains: filters.title, mode: 'insensitive' };
  }
  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.leadId) {
    where.leadId = filters.leadId;
  }
  if (filters.assignedToId) {
    where.assignedToId = filters.assignedToId;
  }

  const [tasks, total] = await Promise.all([
    database.task.findMany({
      where,
      select: taskSelect,
      skip,
      take,
      orderBy,
    }),
    database.task.count({ where }),
  ]);

  return createPaginationResult(tasks, total, pagination);
};

const getTaskById = async (id: string) => {
  return database.task.findUnique({
    where: { id },
    select: taskSelect,
  });
};

const createTask = async (payload: {
  title: string;
  description?: string;
  dueDate?: Date;
  leadId?: string;
  assignedToId?: string;
  createdById: string;
}) => {
  return database.task.create({
    data: payload,
    select: taskSelect,
  });
};

const updateTask = async (
  id: string,
  payload: {
    title?: string;
    description?: string;
    dueDate?: Date;
    leadId?: string;
    assignedToId?: string;
  }
) => {
  return database.task.update({
    where: { id },
    data: payload,
    select: taskSelect,
  });
};

const updateTaskStatus = async (id: string, status: TaskStatus) => {
  return database.task.update({
    where: { id },
    data: { status },
    select: taskSelect,
  });
};

const deleteTask = async (id: string) => {
  return database.task.delete({
    where: { id },
    select: { id: true },
  });
};

export const TaskRepository = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
