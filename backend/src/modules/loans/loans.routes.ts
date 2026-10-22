import { Router } from 'express';
import * as loansController from './loans.controller';
import { requireAuth } from '../../middleware/auth';
import { uploadReceipt } from '../../middleware/upload';

const router = Router();

// All loan endpoints require authentication
router.use(requireAuth);

router.get('/', loansController.getLoans);
router.post('/', loansController.createLoan);
router.patch('/:id/repay', loansController.repayLoan);
router.post('/upload-receipt', uploadReceipt.single('receipt'), loansController.uploadReceiptFile);

export default router;
