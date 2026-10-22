import { z } from 'zod';

export const createLoanSchema = z.object({
  friendName: z
    .string({ required_error: 'Friend name is required' })
    .trim()
    .min(1, 'Friend name cannot be empty')
    .max(100, 'Friend name cannot exceed 100 characters'),
  amount: z
    .union([z.string(), z.number()], { required_error: 'Amount is required' })
    .transform((val) => String(val).trim())
    .refine((val) => {
      // Must be positive decimal number with up to 2 decimal places
      return /^(0|[1-9]\d*)(\.\d{1,2})?$/.test(val);
    }, 'Amount must be a valid positive number with at most 2 decimal places')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, 'Amount must be greater than zero')
    .refine((val) => {
      const num = parseFloat(val);
      return num <= 999999999.99;
    }, 'Amount exceeds maximum allowed limit'),
  dueDate: z
    .string({ required_error: 'Due date is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format')
    .refine((val) => {
      const date = new Date(`${val}T00:00:00`);
      return !isNaN(date.getTime());
    }, 'Due date must be a valid calendar date'),
  receiptUrl: z.string().url('Receipt URL must be a valid URL').optional().nullable(),
});

export const loanQuerySchema = z.object({
  status: z.enum(['all', 'outstanding', 'overdue', 'repaid']).optional().default('all'),
});

export type CreateLoanInput = z.infer<typeof createLoanSchema>;
export type LoanQueryInput = z.infer<typeof loanQuerySchema>;
