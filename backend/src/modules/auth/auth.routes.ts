import { Router } from 'express';
import * as authController from './auth.controller';
import { sendOtpLimiter, verifyOtpLimiter } from '../../middleware/rateLimiter';

const router = Router();

router.post('/send-otp', sendOtpLimiter, authController.sendOtp);
router.post('/verify-otp', verifyOtpLimiter, authController.verifyOtp);

export default router;
