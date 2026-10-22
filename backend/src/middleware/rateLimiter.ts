import rateLimit from 'express-rate-limit';

const isTest = process.env.NODE_ENV === 'test';

export const sendOtpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: isTest ? 1000 : 10, // max 10 requests per 5 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many OTP requests. Please wait a few minutes before trying again.',
      },
    });
  },
});

export const verifyOtpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: isTest ? 1000 : 20, // max 20 attempts per 5 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many verification attempts. Please wait before trying again.',
      },
    });
  },
});
