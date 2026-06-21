import express from 'express';
const router = express.Router();
import {
    getAttendance,
    saveAttendance,
    getAttendanceHistory,
    getAttendanceStats,
    getAttendanceMatrix,
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/')
    .get(protect, getAttendance)
    .post(protect, saveAttendance);

router.get('/history', protect, getAttendanceHistory);
router.get('/stats', protect, getAttendanceStats);
router.get('/matrix', protect, getAttendanceMatrix);

export default router;
