import express from 'express';
const router = express.Router();
import { getNotifications, sendNotification, deleteNotification } from '../controllers/notificationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const canModify = authorize('superadmin', 'school-admin', 'teacher');

router.route('/').get(protect, getNotifications).post(protect, canModify, sendNotification);
router.delete('/:id', protect, canModify, deleteNotification);

export default router;
