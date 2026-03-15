import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import validateRequest from '../../middleware/validation.middleware';
import { AuditController } from './auditLogs.controller';
import { AuditValidation } from './auditLogs.validation';

const router = Router();

router.get(
  '/',
  auth('view:audit'),
  validateRequest(AuditValidation.getAllLogs),
  AuditController.getAllLogs
);
router.get(
  '/user/:userId',
  auth('view:audit'),
  validateRequest(AuditValidation.getUserLogs),
  AuditController.getUserLogs
);

export const AuditRoutes = router;
