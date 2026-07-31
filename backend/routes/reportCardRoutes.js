import express from 'express';
const router = express.Router();
import { getReportCard } from '../controllers/reportCardController.js';
import { protect } from '../middleware/authMiddleware.js';

router.get('/', protect, getReportCard);

export default router;
