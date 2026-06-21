import express from 'express';
const router = express.Router();
import { getDashboardStats } from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router.route('/')
    .get(protect, authorize('superadmin', 'school-admin', 'teacher'), getDashboardStats);

export default router;