import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import validateRequest from '../../middleware/validation.middleware';
import { SettingController } from './settings.controller';
import { SettingValidation } from './settings.validation';

const router = Router();

router
  .route('/')
  .get(
    auth('view:settings'),
    validateRequest(SettingValidation.getAllSettings),
    SettingController.getAllSettings
  )
  .post(
    auth('manage:settings'),
    validateRequest(SettingValidation.upsertSetting),
    SettingController.upsertSetting
  );

router
  .route('/:key')
  .get(
    auth('view:settings'),
    validateRequest(SettingValidation.getSettingByKey),
    SettingController.getSettingByKey
  )
  .delete(
    auth('manage:settings'),
    validateRequest(SettingValidation.deleteSetting),
    SettingController.deleteSetting
  );

export const SettingRoutes = router;
