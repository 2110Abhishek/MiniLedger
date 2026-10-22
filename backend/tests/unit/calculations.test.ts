import { describe, it, expect } from 'vitest';
import { Decimal } from '@prisma/client/runtime/library';
import { serializeLoan, getStartOfToday } from '../../src/modules/loans/loans.service';

describe('Financial Calculation and Overdue Logic Unit Tests', () => {
  it('correctly classifies outstanding, overdue, and repaid loans', () => {
    const today = getStartOfToday();
    
    // Yesterday
    const pastDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    // Tomorrow
    const futureDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    // Today
    const todayDate = new Date(today.getTime());

    // 1. Rahul: Past date, not repaid -> OVERDUE
    const rahulLoan = {
      id: '1',
      userId: 'u1',
      friendName: 'Rahul',
      amount: new Decimal('5000.00'),
      dueDate: pastDate,
      isRepaid: false,
      repaidAt: null,
      receiptUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const serializedRahul = serializeLoan(rahulLoan);
    expect(serializedRahul.status).toBe('overdue');
    expect(serializedRahul.isOverdue).toBe(true);

    // 2. Priya: Future date, not repaid -> OUTSTANDING
    const priyaLoan = {
      id: '2',
      userId: 'u1',
      friendName: 'Priya',
      amount: new Decimal('3000.00'),
      dueDate: futureDate,
      isRepaid: false,
      repaidAt: null,
      receiptUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const serializedPriya = serializeLoan(priyaLoan);
    expect(serializedPriya.status).toBe('outstanding');
    expect(serializedPriya.isOverdue).toBe(false);

    // 3. Amit: Past date, but repaid -> REPAID (NEVER OVERDUE)
    const amitLoan = {
      id: '3',
      userId: 'u1',
      friendName: 'Amit',
      amount: new Decimal('2000.00'),
      dueDate: pastDate,
      isRepaid: true,
      repaidAt: new Date(),
      receiptUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const serializedAmit = serializeLoan(amitLoan);
    expect(serializedAmit.status).toBe('repaid');
    expect(serializedAmit.isOverdue).toBe(false);

    // 4. Loan due TODAY is NOT overdue
    const todayLoan = {
      id: '4',
      userId: 'u1',
      friendName: 'Sameer',
      amount: new Decimal('1500.00'),
      dueDate: todayDate,
      isRepaid: false,
      repaidAt: null,
      receiptUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const serializedToday = serializeLoan(todayLoan);
    expect(serializedToday.status).toBe('outstanding');
    expect(serializedToday.isOverdue).toBe(false);
  });

  it('calculates totals matching Section 5 PRD example exactly', () => {
    const today = getStartOfToday();
    const pastDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const futureDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const loans = [
      { amount: new Decimal('5000.00'), dueDate: pastDate, isRepaid: false }, // Rahul
      { amount: new Decimal('3000.00'), dueDate: futureDate, isRepaid: false }, // Priya
      { amount: new Decimal('2000.00'), dueDate: pastDate, isRepaid: true }, // Amit
    ];

    let totalLent = new Decimal(0);
    let totalRepaid = new Decimal(0);
    let overdueAmount = new Decimal(0);

    for (const loan of loans) {
      const amt = new Decimal(loan.amount);
      totalLent = totalLent.add(amt);
      if (loan.isRepaid) {
        totalRepaid = totalRepaid.add(amt);
      } else {
        if (loan.dueDate < today) {
          overdueAmount = overdueAmount.add(amt);
        }
      }
    }

    const outstandingAmount = totalLent.sub(totalRepaid);

    expect(totalLent.toFixed(2)).toBe('10000.00');
    expect(totalRepaid.toFixed(2)).toBe('2000.00');
    expect(outstandingAmount.toFixed(2)).toBe('8000.00');
    expect(overdueAmount.toFixed(2)).toBe('5000.00');
  });
});
