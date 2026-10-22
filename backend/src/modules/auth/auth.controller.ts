import { Request, Response, NextFunction } from 'express';
import { sendOtpSchema, verifyOtpSchema } from './auth.validation';
import * as authService from './auth.service';

export async function sendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = sendOtpSchema.parse(req.body);
    const result = await authService.sendOtp(validated.phoneNumber);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = verifyOtpSchema.parse(req.body);
    const result = await authService.verifyOtp(validated.phoneNumber, validated.otp);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
