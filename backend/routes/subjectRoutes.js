import express from 'express';
const router = express.Router();
import {
    getSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    importSubjects,          // <-- IMPORT NEW FUNCTION
    deleteMultipleSubjects,  // <-- IMPORT NEW FUNCTION
} from '../controllers/subjectController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const canModify = authorize('superadmin', 'admin');

// --- ADD NEW ROUTES ---
// Route for bulk operations
router.post('/import', protect, canModify, importSubjects);
router.post('/delete-multiple', protect, canModify, deleteMultipleSubjects);


// Routes for single items (no change)
router
    .route('/')
    .get(protect, getSubjects)
    .post(protect, canModify, createSubject);

router
    .route('/:id')
    .put(protect, canModify, updateSubject)
    .delete(protect, canModify, deleteSubject);

export default router;