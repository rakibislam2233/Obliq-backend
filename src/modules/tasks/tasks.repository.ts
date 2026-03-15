import { TaskStatus } from '../../../prisma/generated/enums';
import { database } from '../../config/database.config';

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

const getAllTasks = async () => {
  return database.task.findMany({
    select: taskSelect,
    orderBy: { createdAt: 'desc' },
  });
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
