import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import validateRequest from '../../middleware/validation.middleware';
import { ReportController } from './reports.controller';
import { ReportValidation } from './reports.validation';

const router = Router();

router.get(
  '/summary',
  auth('view:reports'),
  validateRequest(ReportValidation.getSummary),
  ReportController.getSummary
);

router.get(
  '/leads-status',
  auth('view:reports'),
  validateRequest(ReportValidation.getLeadStatusReport),
  ReportController.getLeadStatusReport
);

router.get(
  '/tasks-status',
  auth('view:reports'),
  validateRequest(ReportValidation.getTaskStatusReport),
  ReportController.getTaskStatusReport
);

router.get(
  '/users-status',
  auth('view:reports'),
  validateRequest(ReportValidation.getUserStatusReport),
  ReportController.getUserStatusReport
);

export const ReportRoutes = router;
