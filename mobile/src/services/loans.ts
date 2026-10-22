import { apiRequest, API_BASE_URL } from './api';
import { Loan, Summary, LoanStatus } from '../types';

export interface CreateLoanPayload {
  friendName: string;
  amount: string;
  dueDate: string;
  receiptUrl?: string | null;
}

export async function getSummary(): Promise<Summary> {
  return apiRequest<Summary>('/summary');
}

export async function getLoans(status?: 'all' | LoanStatus): Promise<Loan[]> {
  const query = status && status !== 'all' ? `?status=${status}` : '';
  return apiRequest<Loan[]>(`/loans${query}`);
}

export async function createLoan(payload: CreateLoanPayload): Promise<Loan> {
  return apiRequest<Loan>('/loans', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function repayLoan(loanId: string): Promise<Loan> {
  return apiRequest<Loan>(`/loans/${loanId}/repay`, {
    method: 'PATCH',
  });
}

export async function uploadReceiptImage(uri: string): Promise<string> {
  const formData = new FormData();

  // Handle web vs native image upload
  if (uri.startsWith('data:') || uri.startsWith('blob:')) {
    const response = await fetch(uri);
    const blob = await response.blob();
    formData.append('receipt', blob, 'receipt.jpg');
  } else {
    const filename = uri.split('/').pop() || 'receipt.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    formData.append('receipt', {
      uri,
      name: filename,
      type,
    } as any);
  }

  const res = await apiRequest<{ receiptUrl: string }>('/loans/upload-receipt', {
    method: 'POST',
    body: formData,
  });

  return res.receiptUrl;
}

export function formatINR(val: string | number): string {
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return '₹0.00';
  return '₹' + num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
