import crypto from 'crypto';

const SALT = 'miniledger_otp_salt_secret';

export function generateSixDigitOtp(): string {
  // Generate random 6-digit code between 100000 and 999999
  const randomInt = crypto.randomInt(100000, 1000000);
  return randomInt.toString();
}

export function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(`${otp}:${SALT}`).digest('hex');
}

export function verifyOtpHash(otp: string, storedHash: string): boolean {
  const hash = hashOtp(otp);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(storedHash));
}

export function printOtpToTerminal(phoneNumber: string, otp: string, expiresInSeconds: number): void {
  const border = '═'.repeat(54);
  console.log('\n' + border);
  console.log(`║ 🔑 [DEV ONLY] MOCK OTP AUTHENTICATION CODE        ║`);
  console.log(border);
  console.log(`║ Phone Number : ${phoneNumber.padEnd(35)}║`);
  console.log(`║ OTP Code     : \x1b[1m\x1b[32m${otp}\x1b[0m (valid for ${expiresInSeconds}s)${' '.repeat(22 - otp.length - expiresInSeconds.toString().length)}║`);
  console.log(`║ Notice       : Enter this code on the verify screen ║`);
  console.log(border + '\n');
}
