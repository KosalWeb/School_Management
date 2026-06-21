import express from 'express';
const router = express.Router();
import {
    getStudents,
    createStudent,
    updateStudent,
    deleteStudent,
} from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// --- UPDATED: 'teacher' role added, 'admin' corrected to 'school-admin' ---
const canView = authorize('superadmin', 'school-admin', 'teacher', 'data-entry');
const canModify = authorize('superadmin', 'school-admin', 'teacher', 'data-entry');

router.route('/')
    .get(protect, canView, getStudents)
    .post(protect, canModify, createStudent);

router.route('/:id')
    .put(protect, canModify, updateStudent)
    .delete(protect, canModify, deleteStudent);

export default router;