import express from 'express';
import {
  createCard,
  updateCard,
  moveCard,
  deleteCard,
  addComment,
} from '../controllers/cardController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', createCard);
router.put('/:cardId', updateCard);
router.post('/:cardId/move', moveCard);
router.delete('/:cardId', deleteCard);
router.post('/:cardId/comments', addComment);

export default router;
