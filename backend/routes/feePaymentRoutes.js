import express from 'express';
const router = express.Router();
import {
    getFeePayments,
    createFeePayment,
    updateFeePayment,
    deleteFeePayment,
} from '../controllers/feePaymentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const canModify = authorize('superadmin', 'school-admin', 'data-entry');

router
    .route('/')
    .get(protect, getFeePayments)
    .post(protect, canModify, createFeePayment);

router
    .route('/:id')
    .put(protect, canModify, updateFeePayment)
    .delete(protect, canModify, deleteFeePayment);

export default router;
