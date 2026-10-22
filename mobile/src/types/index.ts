export interface User {
  id: string;
  phoneNumber: string;
}

export type LoanStatus = 'outstanding' | 'overdue' | 'repaid';

export interface Loan {
  id: string;
  userId: string;
  friendName: string;
  amount: string;
  dueDate: string;
  isRepaid: boolean;
  repaidAt: string | null;
  status: LoanStatus;
  isOverdue: boolean;
  receiptUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Summary {
  totalLent: string;
  totalRepaid: string;
  outstandingAmount: string;
  overdueAmount: string;
  currency: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: User;
}

export interface ApiError {
  code: string;
  message: string;
}
