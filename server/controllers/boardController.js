import { BoardStore, ListStore, CardStore, ActivityStore } from '../models/dbStore.js';

export const getBoards = async (req, res) => {
  try {
    const boards = await BoardStore.getUserBoards(req.user._id);
    return res.status(200).json({ boards });
  } catch (error) {
    console.error('getBoards error:', error);
    return res.status(500).json({ message: 'Failed to retrieve boards.', error: error.message });
  }
};

export const getBoardById = async (req, res) => {
  try {
    const { boardId } = req.params;
    const board = await BoardStore.getById(boardId);

    if (!board) {
      return res.status(404).json({ message: 'Board not found.' });
    }

    const lists = await ListStore.getByBoardId(boardId);
    const cards = await CardStore.getByBoardId(boardId);
    const activities = await ActivityStore.getByBoardId(boardId, 30);

    return res.status(200).json({
      board,
      lists,
      cards,
      activities,
    });
  } catch (error) {
    console.error('getBoardById error:', error);
    return res.status(500).json({ message: 'Failed to retrieve board details.', error: error.message });
  }
};

export const createBoard = async (req, res) => {
  try {
    const { title, description, background } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Board title is required.' });
    }

    const newBoard = await BoardStore.create({
      title: title.trim(),
      description: description || '',
      ownerId: req.user._id,
      background: background || 'gradient-blue',
    });

    // Create default starter lists for a new board
    await ListStore.create({ title: '📋 To Do', boardId: newBoard._id, order: 0 });
    await ListStore.create({ title: '⚡ In Progress', boardId: newBoard._id, order: 1 });
    await ListStore.create({ title: '✅ Done', boardId: newBoard._id, order: 2 });

    const activity = await ActivityStore.create({
      boardId: newBoard._id,
      userId: req.user._id,
      action: 'created board',
      details: `Created board "${newBoard.title}"`,
    });

    return res.status(201).json({ board: newBoard, message: 'Board created successfully!' });
  } catch (error) {
    console.error('createBoard error:', error);
    return res.status(500).json({ message: 'Failed to create board.', error: error.message });
  }
};

export const updateBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title, description, background, isStarred } = req.body;

    const updatedBoard = await BoardStore.update(boardId, {
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description }),
      ...(background !== undefined && { background }),
      ...(isStarred !== undefined && { isStarred }),
    });

    if (!updatedBoard) {
      return res.status(404).json({ message: 'Board not found.' });
    }

    const io = req.app.get('io');
    if (io) {
      io.to(boardId).emit('board_updated', updatedBoard);
    }

    return res.status(200).json({ board: updatedBoard });
  } catch (error) {
    console.error('updateBoard error:', error);
    return res.status(500).json({ message: 'Failed to update board.', error: error.message });
  }
};

export const deleteBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    await BoardStore.delete(boardId);

    const io = req.app.get('io');
    if (io) {
      io.to(boardId).emit('board_deleted', { boardId });
    }

    return res.status(200).json({ message: 'Board deleted successfully.' });
  } catch (error) {
    console.error('deleteBoard error:', error);
    return res.status(500).json({ message: 'Failed to delete board.', error: error.message });
  }
};

export const addBoardMember = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { userId, role } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required.' });
    }

    const updatedBoard = await BoardStore.addMember(boardId, userId, role || 'member');
    
    const activity = await ActivityStore.create({
      boardId,
      userId: req.user._id,
      action: 'added member',
      details: 'Added a new collaborator to the board',
    });

    const io = req.app.get('io');
    if (io) {
      io.to(boardId).emit('board_updated', updatedBoard);
      io.to(boardId).emit('activity_logged', activity);
    }

    return res.status(200).json({ board: updatedBoard, message: 'Collaborator added!' });
  } catch (error) {
    console.error('addBoardMember error:', error);
    return res.status(500).json({ message: 'Failed to add member.', error: error.message });
  }
};
