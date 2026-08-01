import express from 'express';
const router = express.Router();
import {
    getStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    importStudents,
    promoteStudents,
} from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const canView = authorize('superadmin', 'school-admin', 'teacher', 'data-entry');
const canModify = authorize('superadmin', 'school-admin', 'teacher', 'data-entry');

router.post('/import', protect, canModify, importStudents);
router.post('/promote', protect, authorize('superadmin', 'school-admin'), promoteStudents);

router.route('/')
    .get(protect, canView, getStudents)
    .post(protect, canModify, createStudent);

router.route('/:id')
    .put(protect, canModify, updateStudent)
    .delete(protect, canModify, deleteStudent);

export default router;