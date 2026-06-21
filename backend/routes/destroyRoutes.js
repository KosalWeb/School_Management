import express from 'express';
const router = express.Router();
import { destroyAll } from '../controllers/destroyController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router.route('/all')
    .delete(protect, authorize('superadmin'), destroyAll);

export default router;
