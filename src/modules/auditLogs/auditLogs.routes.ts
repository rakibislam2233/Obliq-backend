import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import { AuditController } from './auditLogs.controller';

const router = Router();

router.get('/', auth('view:audit'), AuditController.getAllLogs);

export const AuditRoutes = router;
