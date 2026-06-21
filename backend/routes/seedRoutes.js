import express from 'express';
const router = express.Router();
import { seedAll } from '../controllers/seedController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router.route('/all')
    .post(protect, authorize('superadmin'), seedAll);

export default router;
