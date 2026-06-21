import express from 'express';
const router = express.Router();
import {
    getClasses, createClass, updateClass, deleteClass,
    importClasses, deleteMultipleClasses,
} from '../controllers/classController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// --- UPDATED: 'admin' role corrected to 'school-admin' ---
const canModify = authorize('superadmin', 'school-admin');

// GET route is accessible to more roles for viewing purposes
router.route('/')
    .get(protect, authorize('superadmin', 'school-admin', 'teacher', 'data-entry'), getClasses)
    .post(protect, canModify, createClass);

// Other routes remain the same but use the corrected canModify variable
router.post('/import', protect, canModify, importClasses);
router.post('/delete-multiple', protect, canModify, deleteMultipleClasses);

router.route('/:id')
    .put(protect, canModify, updateClass)
    .delete(protect, canModify, deleteClass);

export default router;