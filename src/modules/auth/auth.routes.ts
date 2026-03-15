import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import {
  forgotPasswordRateLimiter,
  loginRateLimiter,
  refreshTokenRateLimiter,
  resetPasswordRateLimiter,
} from '../../middleware/rate-limit.middleware';
import validateRequest from '../../middleware/validation.middleware';
import { AuthController } from './auth.controller';
import { AuthValidation } from './auth.validation';

const router = Router();

router.post(
  '/login',
  loginRateLimiter,
  validateRequest(AuthValidation.login),
  AuthController.login
);
router.post(
  '/refresh',
  refreshTokenRateLimiter,
  validateRequest(AuthValidation.refresh),
  AuthController.refresh
);
router.post('/logout', auth(), validateRequest(AuthValidation.logout), AuthController.logout);
router.post(
  '/forgot-password',
  forgotPasswordRateLimiter,
  validateRequest(AuthValidation.forgotPassword),
  AuthController.forgotPassword
);
router.post(
  '/reset-password',
  resetPasswordRateLimiter,
  validateRequest(AuthValidation.resetPassword),
  AuthController.resetPassword
);
router.post(
  '/change-password',
  auth(),
  validateRequest(AuthValidation.changePassword),
  AuthController.changePassword
);

export const AuthRoutes = router;
