import express from 'express';
import { getBoardActivities } from '../controllers/activityController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/:boardId', getBoardActivities);

export default router;
