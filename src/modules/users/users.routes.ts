import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import validateRequest from '../../middleware/validation.middleware';
import { UserValidation } from './user.validation';
import { UserController } from './users.controller';

const router = Router();

// GET  /api/users
router
  .route('/')
  .post(
    auth('create:users'),
    validateRequest(UserValidation.createUser),
    UserController.createUser
  )
  .get(auth('view:users'), validateRequest(UserValidation.getAllUsers), UserController.getAllUsers);

// GET  /api/users/:id
router
  .route('/:id')
  .get(auth('view:users'), validateRequest(UserValidation.getUserById), UserController.getUserById)
  .patch(auth('manage:users'), validateRequest(UserValidation.updateUser), UserController.updateUser)
  .delete(auth('delete:users'), validateRequest(UserValidation.deleteUser), UserController.deleteUser);

// PATCH /api/users/:id/status
router.patch(
  '/:id/status',
  auth('manage:users'),
  validateRequest(UserValidation.updateUserStatus),
  UserController.updateUserStatus
);

export const UserRoutes = router;
