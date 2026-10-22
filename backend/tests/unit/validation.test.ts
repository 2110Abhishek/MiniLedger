import { describe, it, expect } from 'vitest';
import {
  normalizePhoneNumber,
  sendOtpSchema,
  verifyOtpSchema,
} from '../../src/modules/auth/auth.validation';
import { createLoanSchema } from '../../src/modules/loans/loans.validation';

describe('Auth Validation Unit Tests', () => {
  it('normalizes 10-digit Indian numbers to E.164 +91 format', () => {
    expect(normalizePhoneNumber('9876543210')).toBe('+919876543210');
    expect(normalizePhoneNumber('09876543210')).toBe('+919876543210');
    expect(normalizePhoneNumber('+91 98765 43210')).toBe('+919876543210');
    expect(normalizePhoneNumber('+91-98765-43210')).toBe('+919876543210');
  });

  it('validates correct phone numbers', () => {
    const res1 = sendOtpSchema.safeParse({ phoneNumber: '+919876543210' });
    expect(res1.success).toBe(true);

    const res2 = sendOtpSchema.safeParse({ phoneNumber: '9876543210' });
    expect(res2.success).toBe(true);
  });

  it('rejects invalid phone numbers', () => {
    const res1 = sendOtpSchema.safeParse({ phoneNumber: '123' });
    expect(res1.success).toBe(false);

    const res2 = sendOtpSchema.safeParse({ phoneNumber: 'abcdefghij' });
    expect(res2.success).toBe(false);

    const res3 = sendOtpSchema.safeParse({ phoneNumber: '' });
    expect(res3.success).toBe(false);
  });

  it('validates 6-digit OTP codes', () => {
    const valid = verifyOtpSchema.safeParse({
      phoneNumber: '+919876543210',
      otp: '123456',
    });
    expect(valid.success).toBe(true);

    const tooShort = verifyOtpSchema.safeParse({
      phoneNumber: '+919876543210',
      otp: '12345',
    });
    expect(tooShort.success).toBe(false);

    const nonNumeric = verifyOtpSchema.safeParse({
      phoneNumber: '+919876543210',
      otp: '12a456',
    });
    expect(nonNumeric.success).toBe(false);
  });
});

describe('Loan Creation Validation Unit Tests', () => {
  it('accepts valid loan input', () => {
    const res = createLoanSchema.safeParse({
      friendName: 'Rahul Sharma',
      amount: '5000.00',
      dueDate: '2026-12-31',
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.friendName).toBe('Rahul Sharma');
      expect(res.data.amount).toBe('5000.00');
      expect(res.data.dueDate).toBe('2026-12-31');
    }
  });

  it('rejects empty or whitespace-only friend name', () => {
    const res1 = createLoanSchema.safeParse({
      friendName: '   ',
      amount: '5000.00',
      dueDate: '2026-12-31',
    });
    expect(res1.success).toBe(false);

    const res2 = createLoanSchema.safeParse({
      friendName: '',
      amount: '5000.00',
      dueDate: '2026-12-31',
    });
    expect(res2.success).toBe(false);
  });

  it('rejects negative or zero loan amount', () => {
    const zero = createLoanSchema.safeParse({
      friendName: 'Priya',
      amount: '0',
      dueDate: '2026-12-31',
    });
    expect(zero.success).toBe(false);

    const negative = createLoanSchema.safeParse({
      friendName: 'Priya',
      amount: '-500',
      dueDate: '2026-12-31',
    });
    expect(negative.success).toBe(false);
  });

  it('rejects amounts with more than 2 decimal places', () => {
    const res = createLoanSchema.safeParse({
      friendName: 'Priya',
      amount: '100.999',
      dueDate: '2026-12-31',
    });
    expect(res.success).toBe(false);
  });

  it('rejects invalid date formats', () => {
    const res1 = createLoanSchema.safeParse({
      friendName: 'Amit',
      amount: '2000.00',
      dueDate: '31-12-2026',
    });
    expect(res1.success).toBe(false);

    const res2 = createLoanSchema.safeParse({
      friendName: 'Amit',
      amount: '2000.00',
      dueDate: 'invalid-date',
    });
    expect(res2.success).toBe(false);
  });
});
