import express from 'express';
import {
  createList,
  updateList,
  reorderLists,
  deleteList,
} from '../controllers/listController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', createList);
router.put('/:listId', updateList);
router.post('/reorder', reorderLists);
router.delete('/:listId', deleteList);

export default router;
