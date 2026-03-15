import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import validateRequest from '../../middleware/validation.middleware';
import { RoleController } from './roles.controller';
import { RoleValidation } from './roles.validation';

const router = Router();

router.get(
  '/',
  auth('view:roles'),
  validateRequest(RoleValidation.getAllRoles),
  RoleController.getAllRoles
);

router.get(
  '/:id/permissions',
  auth('view:roles'),
  validateRequest(RoleValidation.getRolePermissions),
  RoleController.getRolePermissions
);

export const RoleRoutes = router;
