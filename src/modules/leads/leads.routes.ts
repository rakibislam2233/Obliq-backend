import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import validateRequest from '../../middleware/validation.middleware';
import { LeadController } from './leads.controller';
import { LeadValidation } from './leads.validation';

const router = Router();

router
  .route('/')
  .get(auth('view:leads'), validateRequest(LeadValidation.getAllLeads), LeadController.getAllLeads)
  .post(
    auth('create:leads'),
    validateRequest(LeadValidation.createLead),
    LeadController.createLead
  );

router
  .route('/:id')
  .get(auth('view:leads'), validateRequest(LeadValidation.getLeadById), LeadController.getLeadById)
  .patch(
    auth('manage:leads'),
    validateRequest(LeadValidation.updateLead),
    LeadController.updateLead
  )
  .delete(
    auth('delete:leads'),
    validateRequest(LeadValidation.deleteLead),
    LeadController.deleteLead
  );

router.patch(
  '/:id/status',
  auth('manage:leads'),
  validateRequest(LeadValidation.updateLeadStatus),
  LeadController.updateLeadStatus
);

export const LeadRoutes = router;
