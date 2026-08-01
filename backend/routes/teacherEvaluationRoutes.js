import express from 'express';
const router = express.Router();
import { getEvaluations, createEvaluation, updateEvaluation, deleteEvaluation } from '../controllers/teacherEvaluationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const canModify = authorize('superadmin', 'school-admin');

router.route('/').get(protect, getEvaluations).post(protect, canModify, createEvaluation);
router.route('/:id').put(protect, canModify, updateEvaluation).delete(protect, canModify, deleteEvaluation);

export default router;
