import { Request, Response, NextFunction } from 'express';
import { createLoanSchema, loanQuerySchema } from './loans.validation';
import * as loansService from './loans.service';
import { UnauthorizedError, ValidationError } from '../../utils/errors';

export async function createLoan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const validated = createLoanSchema.parse(req.body);
    const loan = await loansService.createLoan(req.user.id, validated);
    res.status(201).json(loan);
  } catch (err) {
    next(err);
  }
}

export async function getLoans(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const query = loanQuerySchema.parse(req.query);
    const loans = await loansService.getLoans(req.user.id, query.status);
    res.status(200).json(loans);
  } catch (err) {
    next(err);
  }
}

export async function repayLoan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const { id } = req.params;
    if (!id) {
      throw new ValidationError('Loan ID parameter is required');
    }
    const updatedLoan = await loansService.repayLoan(req.user.id, id);
    res.status(200).json(updatedLoan);
  } catch (err) {
    next(err);
  }
}

export async function uploadReceiptFile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    if (!req.file) {
      throw new ValidationError('No image file uploaded');
    }

    // Return the relative URL to access the uploaded file
    const receiptUrl = `/uploads/${req.file.filename}`;
    res.status(201).json({ receiptUrl });
  } catch (err) {
    next(err);
  }
}
