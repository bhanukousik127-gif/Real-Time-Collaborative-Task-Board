import jwt from 'jsonwebtoken';
import { UserStore } from '../models/dbStore.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_collaborative_task_board_2026';

    const decoded = jwt.verify(token, secret);
    const user = await UserStore.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found or token invalid.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is invalid or expired.', error: error.message });
  }
};
