import { z } from 'zod';

// Normalize phone number helper
export function normalizePhoneNumber(raw: string): string {
  const trimmed = raw.trim().replace(/[\s\-()]/g, '');
  if (/^[6-9]\d{9}$/.test(trimmed)) {
    return `+91${trimmed}`;
  }
  if (/^0[6-9]\d{9}$/.test(trimmed)) {
    return `+91${trimmed.slice(1)}`;
  }
  if (/^91[6-9]\d{9}$/.test(trimmed)) {
    return `+${trimmed}`;
  }
  return trimmed;
}

export const sendOtpSchema = z.object({
  phoneNumber: z
    .string({ required_error: 'Phone number is required' })
    .min(10, 'Phone number must be at least 10 digits')
    .max(16, 'Phone number is too long')
    .refine((val) => {
      const normalized = normalizePhoneNumber(val);
      // Support E.164 format (+[1-9] followed by 9-14 digits, with Indian +91[6-9]xxxxxxxxx supported)
      return /^\+[1-9]\d{8,14}$/.test(normalized);
    }, 'Please enter a valid phone number (e.g. +91 98765 43210 or 10-digit mobile number)'),
});

export const verifyOtpSchema = z.object({
  phoneNumber: z
    .string({ required_error: 'Phone number is required' })
    .min(10, 'Phone number is invalid'),
  otp: z
    .string({ required_error: 'OTP is required' })
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
