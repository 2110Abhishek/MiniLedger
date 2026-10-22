import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../../utils/prisma';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { CreateLoanInput } from './loans.validation';

export function getStartOfToday(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export function formatDateToYMD(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export interface SerializedLoan {
  id: string;
  userId: string;
  friendName: string;
  amount: string;
  dueDate: string;
  isRepaid: boolean;
  repaidAt: string | null;
  status: 'repaid' | 'overdue' | 'outstanding';
  isOverdue: boolean;
  receiptUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export function serializeLoan(loan: any): SerializedLoan {
  const startOfToday = getStartOfToday();
  const dueDate = new Date(loan.dueDate);
  // Loan due today or later is not overdue. Repaid loan is never overdue.
  const isOverdue = !loan.isRepaid && dueDate < startOfToday;
  
  let status: 'repaid' | 'overdue' | 'outstanding' = 'outstanding';
  if (loan.isRepaid) {
    status = 'repaid';
  } else if (isOverdue) {
    status = 'overdue';
  }

  return {
    id: loan.id,
    userId: loan.userId,
    friendName: loan.friendName,
    amount: new Decimal(loan.amount).toFixed(2),
    dueDate: formatDateToYMD(dueDate),
    isRepaid: loan.isRepaid,
    repaidAt: loan.repaidAt ? loan.repaidAt.toISOString() : null,
    status,
    isOverdue,
    receiptUrl: loan.receiptUrl || null,
    createdAt: loan.createdAt.toISOString(),
    updatedAt: loan.updatedAt.toISOString(),
  };
}

export async function createLoan(userId: string, input: CreateLoanInput): Promise<SerializedLoan> {
  const dueDate = new Date(`${input.dueDate}T00:00:00.000Z`);

  const loan = await prisma.loan.create({
    data: {
      userId,
      friendName: input.friendName,
      amount: new Decimal(input.amount),
      dueDate,
      receiptUrl: input.receiptUrl || null,
    },
  });

  return serializeLoan(loan);
}

export async function getLoans(
  userId: string,
  statusFilter: 'all' | 'outstanding' | 'overdue' | 'repaid' = 'all'
): Promise<SerializedLoan[]> {
  const loans = await prisma.loan.findMany({
    where: { userId },
    orderBy: [
      { isRepaid: 'asc' }, // Outstanding & Overdue first
      { dueDate: 'asc' },  // Earliest due dates first
    ],
  });

  const serialized = loans.map(serializeLoan);

  if (statusFilter === 'all') {
    return serialized;
  }
  return serialized.filter((l) => l.status === statusFilter);
}

export async function repayLoan(userId: string, loanId: string): Promise<SerializedLoan> {
  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
  });

  if (!loan || loan.userId !== userId) {
    throw new NotFoundError('Loan not found or access denied');
  }

  if (loan.isRepaid) {
    throw new ConflictError('This loan has already been marked as repaid');
  }

  const updatedLoan = await prisma.loan.update({
    where: { id: loanId },
    data: {
      isRepaid: true,
      repaidAt: new Date(),
    },
  });

  return serializeLoan(updatedLoan);
}
