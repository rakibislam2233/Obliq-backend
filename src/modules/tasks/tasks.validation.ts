import { z } from 'zod';
import { TaskStatus } from '../../../prisma/generated/enums';

const idParamSchema = z.object({
  id: z.string().min(1, 'Task id is required'),
});

const getAllTasks = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

const getTaskById = z.object({
  body: z.object({}).optional(),
  params: idParamSchema,
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

const createTask = z.object({
  body: z.object({
    title: z.string().min(1, 'Task title is required'),
    description: z.string().optional(),
    dueDate: z.coerce.date().optional(),
    leadId: z.string().optional(),
    assignedToId: z.string().optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

const updateTask = z.object({
  body: z
    .object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      dueDate: z.coerce.date().optional(),
      leadId: z.string().optional(),
      assignedToId: z.string().optional(),
    })
    .refine(value => Object.keys(value).length > 0, {
      message: 'At least one field is required to update task',
    }),
  params: idParamSchema,
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

const updateTaskStatus = z.object({
  body: z.object({
    status: z.enum(Object.values(TaskStatus) as [string, ...string[]]),
  }),
  params: idParamSchema,
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

const deleteTask = z.object({
  body: z.object({}).optional(),
  params: idParamSchema,
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
});

export const TaskValidation = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
