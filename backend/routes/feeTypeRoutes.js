import express from 'express';
const router = express.Router();
import {
    getFeeTypes,
    createFeeType,
    updateFeeType,
    deleteFeeType,
} from '../controllers/feeTypeController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const canModify = authorize('superadmin', 'school-admin');

router
    .route('/')
    .get(protect, getFeeTypes)
    .post(protect, canModify, createFeeType);

router
    .route('/:id')
    .put(protect, canModify, updateFeeType)
    .delete(protect, canModify, deleteFeeType);

export default router;
