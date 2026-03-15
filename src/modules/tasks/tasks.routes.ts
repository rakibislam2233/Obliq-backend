import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import validateRequest from '../../middleware/validation.middleware';
import { TaskController } from './tasks.controller';
import { TaskValidation } from './tasks.validation';

const router = Router();

router
  .route('/')
  .get(auth('view:tasks'), validateRequest(TaskValidation.getAllTasks), TaskController.getAllTasks)
  .post(
    auth('create:tasks'),
    validateRequest(TaskValidation.createTask),
    TaskController.createTask
  );

router
  .route('/:id')
  .get(auth('view:tasks'), validateRequest(TaskValidation.getTaskById), TaskController.getTaskById)
  .patch(
    auth('manage:tasks'),
    validateRequest(TaskValidation.updateTask),
    TaskController.updateTask
  )
  .delete(
    auth('delete:tasks'),
    validateRequest(TaskValidation.deleteTask),
    TaskController.deleteTask
  );

router.patch(
  '/:id/status',
  auth('manage:tasks'),
  validateRequest(TaskValidation.updateTaskStatus),
  TaskController.updateTaskStatus
);

export const TaskRoutes = router;
