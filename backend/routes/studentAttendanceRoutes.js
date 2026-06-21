import express from 'express';
const router = express.Router();
import {
    getStudentAttendance,
    saveStudentAttendance,
    getStudentAttendanceHistory,
    getStudentAttendanceStats,
    getStudentAttendanceMatrix,
} from '../controllers/studentAttendanceController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/')
    .get(protect, getStudentAttendance)
    .post(protect, saveStudentAttendance);

router.get('/history', protect, getStudentAttendanceHistory);
router.get('/stats', protect, getStudentAttendanceStats);
router.get('/matrix', protect, getStudentAttendanceMatrix);

export default router;
