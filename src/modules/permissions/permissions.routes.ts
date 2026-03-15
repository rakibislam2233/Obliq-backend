import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import validateRequest from '../../middleware/validation.middleware';
import { PermissionController } from './permissions.controller';
import { PermissionValidation } from './permissions.validation';

const router = Router();

router.get(
  '/',
  auth('view:permissions'),
  validateRequest(PermissionValidation.getAllPermissions),
  PermissionController.getAllPermissions
);

router.get(
  '/me',
  auth(),
  validateRequest(PermissionValidation.getMyPermissions),
  PermissionController.getMyPermissions
);

router.get(
  '/users/:userId',
  auth('view:permissions'),
  validateRequest(PermissionValidation.getUserPermissions),
  PermissionController.getUserPermissions
);

router.post(
  '/grant',
  auth('manage:permissions'),
  validateRequest(PermissionValidation.grantPermission),
  PermissionController.grantPermission
);

router.post(
  '/revoke',
  auth('manage:permissions'),
  validateRequest(PermissionValidation.revokePermission),
  PermissionController.revokePermission
);

export const PermissionRoutes = router;
