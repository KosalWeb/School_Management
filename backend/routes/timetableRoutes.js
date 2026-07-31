import express from 'express';
const router = express.Router();
import {
    getTimetable,
    getTimetableGrid,
    createTimetableEntry,
    updateTimetableEntry,
    deleteTimetableEntry,
} from '../controllers/timetableController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const canModify = authorize('superadmin', 'school-admin');

router
    .route('/')
    .get(protect, getTimetable)
    .post(protect, canModify, createTimetableEntry);

router.get('/grid/:classId', protect, getTimetableGrid);

router
    .route('/:id')
    .put(protect, canModify, updateTimetableEntry)
    .delete(protect, canModify, deleteTimetableEntry);

export default router;
