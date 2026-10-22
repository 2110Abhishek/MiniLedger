import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/utils/prisma';
import { hashOtp } from '../../src/utils/otp';

describe('MiniLedger API Integration Tests', () => {
  const testPhone1 = '+919999911111';
  const testPhone2 = '+919999922222';
  let tokenUser1: string;
  let tokenUser2: string;
  let userId1: string;
  let userId2: string;

  beforeAll(async () => {
    // Clean up test data
    await prisma.loan.deleteMany({
      where: {
        user: {
          phoneNumber: { in: [testPhone1, testPhone2] },
        },
      },
    });
    await prisma.otpChallenge.deleteMany({
      where: {
        phoneNumber: { in: [testPhone1, testPhone2] },
      },
    });
    await prisma.user.deleteMany({
      where: {
        phoneNumber: { in: [testPhone1, testPhone2] },
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('1. Authentication Flow', () => {
    it('POST /api/auth/send-otp generates an OTP and does not expose it in response', async () => {
      const res = await request(app)
        .post('/api/auth/send-otp')
        .send({ phoneNumber: testPhone1 });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'OTP generated successfully');
      expect(res.body).toHaveProperty('expiresIn');
      expect(res.body).not.toHaveProperty('otp');

      // Verify OTP is hashed in DB
      const challenge = await prisma.otpChallenge.findFirst({
        where: { phoneNumber: testPhone1 },
        orderBy: { createdAt: 'desc' },
      });
      expect(challenge).not.toBeNull();
      expect(challenge?.otpHash).toBeTruthy();
      expect(challenge?.consumedAt).toBeNull();
    });

    it('POST /api/auth/verify-otp fails with incorrect OTP', async () => {
      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({ phoneNumber: testPhone1, otp: '000000' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('POST /api/auth/verify-otp succeeds with valid OTP and issues JWT', async () => {
      // Seed a known OTP for testPhone1
      const testOtp = '654321';
      await prisma.otpChallenge.create({
        data: {
          phoneNumber: testPhone1,
          otpHash: hashOtp(testOtp),
          expiresAt: new Date(Date.now() + 300000),
        },
      });

      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({ phoneNumber: testPhone1, otp: testOtp });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('tokenType', 'Bearer');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.phoneNumber).toBe(testPhone1);

      tokenUser1 = res.body.accessToken;
      userId1 = res.body.user.id;

      // Ensure OTP cannot be reused
      const replayRes = await request(app)
        .post('/api/auth/verify-otp')
        .send({ phoneNumber: testPhone1, otp: testOtp });

      expect(replayRes.status).toBe(400);
    });

    it('sets up a second user (User 2) for isolation testing', async () => {
      const testOtp = '112233';
      await prisma.otpChallenge.create({
        data: {
          phoneNumber: testPhone2,
          otpHash: hashOtp(testOtp),
          expiresAt: new Date(Date.now() + 300000),
        },
      });

      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({ phoneNumber: testPhone2, otp: testOtp });

      expect(res.status).toBe(200);
      tokenUser2 = res.body.accessToken;
      userId2 = res.body.user.id;
      expect(userId1).not.toBe(userId2);
    });
  });

  describe('2. Security and Protected Endpoints', () => {
    it('GET /api/loans rejects unauthenticated requests', async () => {
      const res = await request(app).get('/api/loans');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('GET /api/summary rejects requests with invalid tokens', async () => {
      const res = await request(app)
        .get('/api/summary')
        .set('Authorization', 'Bearer invalid.token.value');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('3. Loan Management Flow', () => {
    let loan1Id: string;
    let loan2Id: string;

    it('POST /api/loans creates a new loan for User 1', async () => {
      const res = await request(app)
        .post('/api/loans')
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({
          friendName: 'Rahul',
          amount: '5000.00',
          dueDate: '2026-01-15', // Past date -> overdue
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.friendName).toBe('Rahul');
      expect(res.body.amount).toBe('5000.00');
      expect(res.body.status).toBe('overdue');
      expect(res.body.isOverdue).toBe(true);
      expect(res.body.isRepaid).toBe(false);

      loan1Id = res.body.id;
    });

    it('POST /api/loans creates a second loan for User 1 (future due date)', async () => {
      const res = await request(app)
        .post('/api/loans')
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({
          friendName: 'Priya',
          amount: '3000.00',
          dueDate: '2027-11-20', // Future date -> outstanding
        });

      expect(res.status).toBe(201);
      expect(res.body.friendName).toBe('Priya');
      expect(res.body.amount).toBe('3000.00');
      expect(res.body.status).toBe('outstanding');
      expect(res.body.isOverdue).toBe(false);

      loan2Id = res.body.id;
    });

    it('POST /api/loans rejects invalid input (negative amount, missing friendName)', async () => {
      const res = await request(app)
        .post('/api/loans')
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send({
          friendName: '',
          amount: '-100.00',
          dueDate: '2026-11-20',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('GET /api/loans returns only User 1 loans', async () => {
      const res = await request(app)
        .get('/api/loans')
        .set('Authorization', `Bearer ${tokenUser1}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body.every((l: any) => l.userId === userId1)).toBe(true);
    });

    it('GET /api/loans for User 2 returns empty list (Data Isolation)', async () => {
      const res = await request(app)
        .get('/api/loans')
        .set('Authorization', `Bearer ${tokenUser2}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('PATCH /api/loans/:id/repay rejects User 2 attempting to repay User 1 loan', async () => {
      const res = await request(app)
        .patch(`/api/loans/${loan1Id}/repay`)
        .set('Authorization', `Bearer ${tokenUser2}`);

      expect(res.status).toBe(404); // Scoped to user -> Not Found or access denied
    });

    it('GET /api/summary returns correct totals before repayment', async () => {
      const res = await request(app)
        .get('/api/summary')
        .set('Authorization', `Bearer ${tokenUser1}`);

      expect(res.status).toBe(200);
      expect(res.body.totalLent).toBe('8000.00');
      expect(res.body.totalRepaid).toBe('0.00');
      expect(res.body.outstandingAmount).toBe('8000.00');
      expect(res.body.overdueAmount).toBe('5000.00');
      expect(res.body.currency).toBe('INR');
    });

    it('PATCH /api/loans/:id/repay successfully repays the overdue loan', async () => {
      const res = await request(app)
        .patch(`/api/loans/${loan1Id}/repay`)
        .set('Authorization', `Bearer ${tokenUser1}`);

      expect(res.status).toBe(200);
      expect(res.body.isRepaid).toBe(true);
      expect(res.body.status).toBe('repaid');
      expect(res.body.isOverdue).toBe(false);
      expect(res.body.repaidAt).not.toBeNull();
    });

    it('PATCH /api/loans/:id/repay prevents duplicate repayment (409 Conflict)', async () => {
      const res = await request(app)
        .patch(`/api/loans/${loan1Id}/repay`)
        .set('Authorization', `Bearer ${tokenUser1}`);

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('GET /api/summary reflects updated totals after repayment', async () => {
      const res = await request(app)
        .get('/api/summary')
        .set('Authorization', `Bearer ${tokenUser1}`);

      expect(res.status).toBe(200);
      expect(res.body.totalLent).toBe('8000.00');
      expect(res.body.totalRepaid).toBe('5000.00');
      expect(res.body.outstandingAmount).toBe('3000.00');
      expect(res.body.overdueAmount).toBe('0.00'); // No more overdue loans!
      expect(res.body.currency).toBe('INR');
    });

    it('GET /api/loans?status=repaid returns only repaid loans', async () => {
      const res = await request(app)
        .get('/api/loans?status=repaid')
        .set('Authorization', `Bearer ${tokenUser1}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].id).toBe(loan1Id);
    });

    it('GET /api/loans?status=outstanding returns only active loans', async () => {
      const res = await request(app)
        .get('/api/loans?status=outstanding')
        .set('Authorization', `Bearer ${tokenUser1}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].id).toBe(loan2Id);
    });
  });
});
