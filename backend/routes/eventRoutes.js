import express from 'express';
const router = express.Router();
import { getEvents, createEvent, updateEvent, deleteEvent } from '../controllers/eventController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const canModify = authorize('superadmin', 'school-admin');

router.route('/').get(protect, getEvents).post(protect, canModify, createEvent);
router.route('/:id').put(protect, canModify, updateEvent).delete(protect, canModify, deleteEvent);

export default router;
