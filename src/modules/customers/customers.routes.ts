import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import validateRequest from '../../middleware/validation.middleware';
import { CustomerController } from './customers.controller';
import { CustomerValidation } from './customers.validation';

const router = Router();

router
  .route('/')
  .get(
    auth('view:customers'),
    validateRequest(CustomerValidation.getAllCustomers),
    CustomerController.getAllCustomers
  )
  .post(
    auth('manage:customers'),
    validateRequest(CustomerValidation.createCustomer),
    CustomerController.createCustomer
  );

router
  .route('/:id')
  .get(
    auth('view:customers'),
    validateRequest(CustomerValidation.getCustomerById),
    CustomerController.getCustomerById
  )
  .patch(
    auth('manage:customers'),
    validateRequest(CustomerValidation.updateCustomer),
    CustomerController.updateCustomer
  )
  .delete(
    auth('manage:customers'),
    validateRequest(CustomerValidation.deleteCustomer),
    CustomerController.deleteCustomer
  );

router.patch(
  '/:id/status',
  auth('manage:customers'),
  validateRequest(CustomerValidation.updateCustomerStatus),
  CustomerController.updateCustomerStatus
);

export const CustomerRoutes = router;
