import express from 'express';
const router = express.Router();
import { getExamSchedules, createExamSchedule, updateExamSchedule, deleteExamSchedule } from '../controllers/examScheduleController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const canModify = authorize('superadmin', 'school-admin');

router.route('/').get(protect, getExamSchedules).post(protect, canModify, createExamSchedule);
router.route('/:id').put(protect, canModify, updateExamSchedule).delete(protect, canModify, deleteExamSchedule);

export default router;
