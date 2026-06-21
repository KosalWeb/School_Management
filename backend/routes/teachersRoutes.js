import express from 'express';
const router = express.Router();
import {
    createTeacher,
    getTeachers,
    updateTeacher,
    deleteTeacher
} from '../controllers/teacherController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// FIX: Changed 'schooladmin' to 'school-admin' to match the database role
const canModify = authorize('superadmin', 'admin', 'school-admin');
const canCreate = authorize('superadmin', 'admin', 'school-admin', 'dataentry');

router.route('/')
    .get(protect, getTeachers)
    .post(protect, canCreate, createTeacher);

router.route('/:id')
    .put(protect, canModify, updateTeacher)
    .delete(protect, canModify, deleteTeacher);

export default router;