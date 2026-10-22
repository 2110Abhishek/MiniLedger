import jwt from 'jsonwebtoken';
import { prisma } from '../../utils/prisma';
import { config } from '../../config';
import {
  generateSixDigitOtp,
  hashOtp,
  verifyOtpHash,
  printOtpToTerminal,
} from '../../utils/otp';
import { ValidationError, UnauthorizedError } from '../../utils/errors';
import { normalizePhoneNumber } from './auth.validation';

const MAX_OTP_ATTEMPTS = 5;

export async function sendOtp(rawPhoneNumber: string) {
  const phoneNumber = normalizePhoneNumber(rawPhoneNumber);
  const otp = generateSixDigitOtp();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + config.otpExpirySeconds * 1000);

  // Invalidate any previously active OTPs for this phone number
  await prisma.otpChallenge.updateMany({
    where: {
      phoneNumber,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: {
      consumedAt: new Date(),
    },
  });

  // Store new OTP challenge with hash
  await prisma.otpChallenge.create({
    data: {
      phoneNumber,
      otpHash,
      expiresAt,
    },
  });

  // Print mock OTP to terminal as required by Section 4.1 & Section 9 of PRD
  printOtpToTerminal(phoneNumber, otp, config.otpExpirySeconds);

  return {
    message: 'OTP generated successfully',
    expiresIn: config.otpExpirySeconds,
  };
}

export async function verifyOtp(rawPhoneNumber: string, otp: string) {
  const phoneNumber = normalizePhoneNumber(rawPhoneNumber);

  // Find the latest active OTP challenge for this phone number
  const challenge = await prisma.otpChallenge.findFirst({
    where: {
      phoneNumber,
      consumedAt: null,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!challenge) {
    throw new ValidationError('No active OTP found. Please request a new OTP.');
  }

  // Check if expired
  if (new Date() > challenge.expiresAt) {
    throw new ValidationError('OTP has expired. Please request a new OTP.');
  }

  // Check rate limit on incorrect attempts for this OTP
  if (challenge.attemptCount >= MAX_OTP_ATTEMPTS) {
    throw new ValidationError('Too many incorrect attempts. Please request a new OTP.');
  }

  // Increment attempt count
  await prisma.otpChallenge.update({
    where: { id: challenge.id },
    data: { attemptCount: { increment: 1 } },
  });

  // Verify hash
  const isValid = verifyOtpHash(otp, challenge.otpHash);
  if (!isValid) {
    throw new ValidationError('Invalid OTP. Please check and try again.');
  }

  // Mark OTP as consumed (cannot be used again)
  await prisma.otpChallenge.update({
    where: { id: challenge.id },
    data: { consumedAt: new Date() },
  });

  // Upsert user (create if new, or fetch existing)
  const user = await prisma.user.upsert({
    where: { phoneNumber },
    update: {},
    create: { phoneNumber },
    select: {
      id: true,
      phoneNumber: true,
      createdAt: true,
    },
  });

  // Sign JWT
  const accessToken = jwt.sign(
    { userId: user.id, phoneNumber: user.phoneNumber },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'] }
  );

  return {
    accessToken,
    tokenType: 'Bearer',
    user: {
      id: user.id,
      phoneNumber: user.phoneNumber,
    },
  };
}
