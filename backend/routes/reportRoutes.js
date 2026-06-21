import express from 'express';
const router = express.Router();
import { getStats } from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// Define the route for getting stats, protected for admins
router.route('/stats').get(protect, authorize('superadmin', 'admin'), getStats);

export default router;