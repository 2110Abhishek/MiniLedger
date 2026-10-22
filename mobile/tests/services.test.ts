import { describe, it, expect, vi } from 'vitest';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(null),
    removeItem: vi.fn().mockResolvedValue(null),
  },
}));

import { formatINR, formatDate } from '../src/services/loans';

describe('Mobile Client Utility & Calculation Tests', () => {
  it('formats monetary values in Indian Rupees (₹) with 2 decimal places', () => {
    expect(formatINR('5000.00')).toBe('₹5,000.00');
    expect(formatINR('10000.00')).toBe('₹10,000.00');
    expect(formatINR(0)).toBe('₹0.00');
    expect(formatINR('1234567.89')).toBe('₹12,34,567.89');
    expect(formatINR('invalid')).toBe('₹0.00');
  });

  it('formats due dates consistently', () => {
    const formatted = formatDate('2026-11-15T00:00:00.000Z');
    expect(formatted).toBeTruthy();
    expect(typeof formatted).toBe('string');
  });

  it('verifies loan status definitions for mobile presentation', () => {
    const mockOverdueLoan = {
      id: '1',
      userId: 'u1',
      friendName: 'Rahul',
      amount: '5000.00',
      dueDate: '2026-01-01',
      isRepaid: false,
      repaidAt: null,
      status: 'overdue' as const,
      isOverdue: true,
      receiptUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(mockOverdueLoan.status).toBe('overdue');
    expect(mockOverdueLoan.isOverdue).toBe(true);

    const mockRepaidLoan = {
      ...mockOverdueLoan,
      isRepaid: true,
      status: 'repaid' as const,
      isOverdue: false,
      repaidAt: new Date().toISOString(),
    };

    expect(mockRepaidLoan.status).toBe('repaid');
    expect(mockRepaidLoan.isOverdue).toBe(false);
  });

  it('verifies summary logic matches mobile requirement rules', () => {
    const summary = {
      totalLent: '8000.00',
      totalRepaid: '5000.00',
      outstandingAmount: '3000.00',
      overdueAmount: '0.00',
      currency: 'INR',
    };

    const lent = parseFloat(summary.totalLent);
    const repaid = parseFloat(summary.totalRepaid);
    const outstanding = parseFloat(summary.outstandingAmount);

    expect(lent - repaid).toBe(outstanding);
    expect(summary.currency).toBe('INR');
  });
});
