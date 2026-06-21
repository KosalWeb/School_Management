import express from 'express';
const router = express.Router();
import {
    getStudentScores,
    batchSaveScores,
    getHonorTable,
    deleteStudentScore,
} from '../controllers/studentScoreController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const canModify = authorize('superadmin', 'admin');

router.route('/')
    .get(protect, getStudentScores);

router.post('/batch', protect, canModify, batchSaveScores);
router.get('/honor', protect, getHonorTable);
router.delete('/:id', protect, canModify, deleteStudentScore);

export default router;
