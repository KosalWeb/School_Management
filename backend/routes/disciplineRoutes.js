import express from 'express';
const router = express.Router();
import { getDisciplines, createDiscipline, updateDiscipline, deleteDiscipline } from '../controllers/disciplineController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const canModify = authorize('superadmin', 'school-admin');

router.route('/').get(protect, getDisciplines).post(protect, canModify, createDiscipline);
router.route('/:id').put(protect, canModify, updateDiscipline).delete(protect, canModify, deleteDiscipline);

export default router;
