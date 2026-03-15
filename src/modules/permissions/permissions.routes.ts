import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import validateRequest from '../../middleware/validation.middleware';
import { PermissionController } from './permissions.controller';
import { PermissionValidation } from './permissions.validation';

const router = Router();

router
  .route('/')
  .get(
    auth('view:permissions'),
    validateRequest(PermissionValidation.getAllPermissions),
    PermissionController.getAllPermissions
  )
  .post(
    auth('manage:permissions'),
    validateRequest(PermissionValidation.createPermission),
    PermissionController.createPermission
  );

router.get(
  '/me',
  auth(),
  validateRequest(PermissionValidation.getMyPermissions),
  PermissionController.getMyPermissions
);

router.get(
  '/user/:userId',
  auth('view:permissions'),
  validateRequest(PermissionValidation.getUserPermissions),
  PermissionController.getUserPermissions
);

router.post(
  '/user/:userId/grant',
  auth('manage:permissions'),
  validateRequest(PermissionValidation.grantPermission),
  PermissionController.grantPermission
);

router.post(
  '/user/:userId/revoke',
  auth('manage:permissions'),
  validateRequest(PermissionValidation.revokePermission),
  PermissionController.revokePermission
);

router.delete(
  '/:permissionId',
  auth('manage:permissions'),
  validateRequest(PermissionValidation.deletePermission),
  PermissionController.deletePermission
);

export const PermissionRoutes = router;
