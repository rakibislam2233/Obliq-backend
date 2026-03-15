import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import { loginRateLimiter, refreshTokenRateLimiter } from '../../middleware/rate-limit.middleware';
import validateRequest from '../../middleware/validation.middleware';
import { AuthController } from './auth.controller';
import { AuthValidation } from './auth.validation';

const router = Router();

router.post('/login', loginRateLimiter, validateRequest(AuthValidation.login), AuthController.login);
router.post(
	'/refresh',
	refreshTokenRateLimiter,
	validateRequest(AuthValidation.refresh),
	AuthController.refresh
);
router.post('/logout', auth(), validateRequest(AuthValidation.logout), AuthController.logout);

export const AuthRoutes = router;
