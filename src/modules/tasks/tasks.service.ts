import { TaskStatus } from '../../../prisma/generated/enums';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../utils/ApiError';
import { AuditLogRepository } from '../auditLogs/auditLogs.repository';
import { TaskRepository } from './tasks.repository';

const getAllTasks = async () => {
  return TaskRepository.getAllTasks();
};

const getTaskById = async (id: string) => {
  const task = await TaskRepository.getTaskById(id);
  if (!task) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Task not found.');
  }
  return task;
};

const createTask = async (
  actorId: string,
  payload: {
    title: string;
    description?: string;
    dueDate?: Date;
    leadId?: string;
    assignedToId?: string;
  }
) => {
  const created = await TaskRepository.createTask({
    ...payload,
    createdById: actorId,
  });

  await AuditLogRepository.createLog({
    actorId,
    action: 'Task Created',
    targetType: 'Task',
    targetId: created.id,
  });

  return created;
};

const updateTask = async (
  actorId: string,
  id: string,
  payload: {
    title?: string;
    description?: string;
    dueDate?: Date;
    leadId?: string;
    assignedToId?: string;
  }
) => {
  const existing = await TaskRepository.getTaskById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Task not found.');
  }

  const updated = await TaskRepository.updateTask(id, payload);

  await AuditLogRepository.createLog({
    actorId,
    action: 'Task Updated',
    targetType: 'Task',
    targetId: id,
    meta: { updatedFields: Object.keys(payload) },
  });

  return updated;
};

const updateTaskStatus = async (actorId: string, id: string, status: TaskStatus) => {
  const existing = await TaskRepository.getTaskById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Task not found.');
  }

  const updated = await TaskRepository.updateTaskStatus(id, status);

  await AuditLogRepository.createLog({
    actorId,
    action: `Task Status Updated To ${status}`,
    targetType: 'Task',
    targetId: id,
  });

  return updated;
};

const deleteTask = async (actorId: string, id: string) => {
  const existing = await TaskRepository.getTaskById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Task not found.');
  }

  await TaskRepository.deleteTask(id);

  await AuditLogRepository.createLog({
    actorId,
    action: 'Task Deleted',
    targetType: 'Task',
    targetId: id,
  });
};

export const TaskService = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
