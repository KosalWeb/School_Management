import express from 'express';
const router = express.Router();
import {
    getListItems,
    createListItem,
    updateListItem,
    deleteListItem
} from '../controllers/listItemController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const canModify = authorize('superadmin', 'admin');

router.route('/')
    .get(protect, getListItems)
    .post(protect, canModify, createListItem);

router.route('/:id')
    .put(protect, canModify, updateListItem)
    .delete(protect, canModify, deleteListItem);

export default router;