import express from 'express';
const router = express.Router();
import {
    getSchools,
    createSchool,
    updateSchool,
    deleteSchool,
} from '../controllers/schoolController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// GET route is accessible to admins and teachers
// POST route is restricted to superadmin only
router.route('/')
    .get(protect, authorize('superadmin', 'school-admin', 'teacher'), getSchools)
    .post(protect, authorize('superadmin'), createSchool);

// PUT and DELETE routes are restricted to superadmin only
router.route('/:id')
    .put(protect, authorize('superadmin'), updateSchool)
    .delete(protect, authorize('superadmin'), deleteSchool);

export default router;