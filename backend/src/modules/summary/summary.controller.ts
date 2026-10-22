import { Request, Response, NextFunction } from 'express';
import * as summaryService from './summary.service';
import { UnauthorizedError } from '../../utils/errors';

export async function getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const summary = await summaryService.getSummary(req.user.id);
    res.status(200).json(summary);
  } catch (err) {
    next(err);
  }
}
