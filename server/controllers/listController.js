import { ListStore, ActivityStore } from '../models/dbStore.js';

export const createList = async (req, res) => {
  try {
    const { boardId, title } = req.body;

    if (!boardId || !title || !title.trim()) {
      return res.status(400).json({ message: 'Board ID and list title are required.' });
    }

    const newList = await ListStore.create({
      boardId,
      title: title.trim(),
    });

    const activity = await ActivityStore.create({
      boardId,
      userId: req.user._id,
      action: 'created list',
      details: `Created column "${newList.title}"`,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(boardId).emit('list_created', newList);
      io.to(boardId).emit('activity_logged', activity);
    }

    return res.status(201).json({ list: newList });
  } catch (error) {
    console.error('createList error:', error);
    return res.status(500).json({ message: 'Failed to create list.', error: error.message });
  }
};

export const updateList = async (req, res) => {
  try {
    const { listId } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    const updatedList = await ListStore.update(listId, { title: title.trim() });
    if (!updatedList) {
      return res.status(404).json({ message: 'List not found.' });
    }

    const io = req.app.get('io');
    if (io) {
      io.to(updatedList.boardId).emit('list_updated', updatedList);
    }

    return res.status(200).json({ list: updatedList });
  } catch (error) {
    console.error('updateList error:', error);
    return res.status(500).json({ message: 'Failed to update list.', error: error.message });
  }
};

export const reorderLists = async (req, res) => {
  try {
    const { boardId, orderedListIds } = req.body;

    if (!boardId || !Array.isArray(orderedListIds)) {
      return res.status(400).json({ message: 'Board ID and orderedListIds array are required.' });
    }

    const lists = await ListStore.reorder(boardId, orderedListIds);

    const io = req.app.get('io');
    if (io) {
      io.to(boardId).emit('lists_reordered', { orderedListIds });
    }

    return res.status(200).json({ lists });
  } catch (error) {
    console.error('reorderLists error:', error);
    return res.status(500).json({ message: 'Failed to reorder lists.', error: error.message });
  }
};

export const deleteList = async (req, res) => {
  try {
    const { listId } = req.params;
    const { boardId } = req.query;

    await ListStore.delete(listId);

    const io = req.app.get('io');
    if (io && boardId) {
      io.to(boardId).emit('list_deleted', { listId, boardId });
    }

    return res.status(200).json({ message: 'List deleted successfully.' });
  } catch (error) {
    console.error('deleteList error:', error);
    return res.status(500).json({ message: 'Failed to delete list.', error: error.message });
  }
};
