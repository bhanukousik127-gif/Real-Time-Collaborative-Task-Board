import { ActivityStore } from '../models/dbStore.js';

export const getBoardActivities = async (req, res) => {
  try {
    const { boardId } = req.params;
    const activities = await ActivityStore.getByBoardId(boardId, 50);
    return res.status(200).json({ activities });
  } catch (error) {
    console.error('getBoardActivities error:', error);
    return res.status(500).json({ message: 'Failed to retrieve activities.', error: error.message });
  }
};
