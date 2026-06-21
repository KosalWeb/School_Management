import express from 'express';
const router = express.Router();
import {
    authUser,
    registerUser,
    getUsers,
    updateUser,
    deleteUser,
    updateUserPassword
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router.post('/login', authUser);

router.route('/')
    .post(protect, authorize('superadmin', 'school-admin'), registerUser)
    .get(protect, authorize('superadmin', 'school-admin'), getUsers);

router.route('/:id')
    .put(protect, authorize('superadmin', 'school-admin'), updateUser)
    .delete(protect, authorize('superadmin', 'school-admin'), deleteUser);

router.route('/:id/password')
    .put(protect, authorize('superadmin', 'school-admin'), updateUserPassword);

export default router;