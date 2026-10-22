import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../../utils/prisma';
import { getStartOfToday } from '../loans/loans.service';

export interface SummaryResult {
  totalLent: string;
  totalRepaid: string;
  outstandingAmount: string;
  overdueAmount: string;
  currency: string;
}

export async function getSummary(userId: string): Promise<SummaryResult> {
  const loans = await prisma.loan.findMany({
    where: { userId },
    select: {
      amount: true,
      dueDate: true,
      isRepaid: true,
    },
  });

  const startOfToday = getStartOfToday();

  let totalLent = new Decimal(0);
  let totalRepaid = new Decimal(0);
  let overdueAmount = new Decimal(0);

  for (const loan of loans) {
    const amount = new Decimal(loan.amount);
    // Total lent = sum of all original loan amounts
    totalLent = totalLent.add(amount);

    if (loan.isRepaid) {
      // Total repaid = sum of all loans marked as repaid
      totalRepaid = totalRepaid.add(amount);
    } else {
      // Outstanding loan check if overdue: dueDate < today
      const dueDate = new Date(loan.dueDate);
      if (dueDate < startOfToday) {
        overdueAmount = overdueAmount.add(amount);
      }
    }
  }

  // Outstanding = Total Lent - Total Repaid
  const outstandingAmount = totalLent.sub(totalRepaid);

  return {
    totalLent: totalLent.toFixed(2),
    totalRepaid: totalRepaid.toFixed(2),
    outstandingAmount: outstandingAmount.toFixed(2),
    overdueAmount: overdueAmount.toFixed(2),
    currency: 'INR',
  };
}
