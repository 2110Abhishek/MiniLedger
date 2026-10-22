import { describe, it, expect } from 'vitest';
import { generateSixDigitOtp, hashOtp, verifyOtpHash } from '../../src/utils/otp';

describe('OTP Logic Unit Tests', () => {
  it('generates a 6-digit string', () => {
    for (let i = 0; i < 20; i++) {
      const otp = generateSixDigitOtp();
      expect(otp).toHaveLength(6);
      expect(/^\d{6}$/.test(otp)).toBe(true);
      const num = parseInt(otp, 10);
      expect(num).toBeGreaterThanOrEqual(100000);
      expect(num).toBeLessThan(1000000);
    }
  });

  it('hashes and securely verifies matching OTP', () => {
    const otp = '482910';
    const hash = hashOtp(otp);
    expect(hash).toBeTruthy();
    expect(typeof hash).toBe('string');
    expect(hash.length).toBe(64); // SHA-256 hex string

    expect(verifyOtpHash(otp, hash)).toBe(true);
    expect(verifyOtpHash('123456', hash)).toBe(false);
  });
});
