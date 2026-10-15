import express from 'express';
import {
  getBoards,
  getBoardById,
  createBoard,
  updateBoard,
  deleteBoard,
  addBoardMember,
} from '../controllers/boardController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getBoards);
router.post('/', createBoard);
router.get('/:boardId', getBoardById);
router.put('/:boardId', updateBoard);
router.delete('/:boardId', deleteBoard);
router.post('/:boardId/members', addBoardMember);

export default router;
