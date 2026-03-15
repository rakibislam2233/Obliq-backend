import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import { UserController } from './users.controller';

const router = Router();

// GET  /api/users
router
  .route('/')
  .post(auth('create:users'), UserController.createUser)
  .get(auth('view:users'), UserController.getAllUsers);

// GET  /api/users/:id
router
  .route('/:id')
  .get(auth('view:users'), UserController.getUserById)
  .patch(auth('manage:users'), UserController.updateUser)
  .delete(auth('delete:users'), UserController.deleteUser);

// PATCH /api/users/:id/status
router.patch('/:id/status', auth('manage:users'), UserController.updateUserStatus);

export const UserRoutes = router;
