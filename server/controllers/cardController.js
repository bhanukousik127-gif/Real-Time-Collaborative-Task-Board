import { CardStore, ActivityStore, ListStore } from '../models/dbStore.js';

export const createCard = async (req, res) => {
  try {
    const { boardId, listId, title, description, priority, labels, dueDate, assignedTo } = req.body;

    if (!boardId || !listId || !title || !title.trim()) {
      return res.status(400).json({ message: 'boardId, listId, and title are required.' });
    }

    const newCard = await CardStore.create({
      boardId,
      listId,
      title: title.trim(),
      description: description || '',
      priority: priority || 'medium',
      labels: labels || [],
      dueDate: dueDate || null,
      assignedTo: assignedTo || [],
    });

    const activity = await ActivityStore.create({
      boardId,
      userId: req.user._id,
      action: 'created task',
      details: `Created task "${newCard.title}"`,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(boardId).emit('card_created', newCard);
      io.to(boardId).emit('activity_logged', activity);
    }

    return res.status(201).json({ card: newCard });
  } catch (error) {
    console.error('createCard error:', error);
    return res.status(500).json({ message: 'Failed to create card.', error: error.message });
  }
};

export const updateCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const updates = req.body;

    const updatedCard = await CardStore.update(cardId, updates);
    if (!updatedCard) {
      return res.status(404).json({ message: 'Card not found.' });
    }

    const io = req.app.get('io');
    if (io) {
      io.to(updatedCard.boardId).emit('card_updated', updatedCard);
    }

    return res.status(200).json({ card: updatedCard });
  } catch (error) {
    console.error('updateCard error:', error);
    return res.status(500).json({ message: 'Failed to update card.', error: error.message });
  }
};

export const moveCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { sourceListId, targetListId, newIndex, boardId } = req.body;

    if (!sourceListId || !targetListId || newIndex === undefined) {
      return res.status(400).json({ message: 'sourceListId, targetListId, and newIndex are required.' });
    }

    const movedCard = await CardStore.move({
      cardId,
      sourceListId,
      targetListId,
      newIndex: parseInt(newIndex, 10),
    });

    if (!movedCard) {
      return res.status(404).json({ message: 'Card not found.' });
    }

    // Refresh all cards on board to ensure indexes are perfectly in sync
    const allCards = await CardStore.getByBoardId(boardId || movedCard.boardId);

    const activity = await ActivityStore.create({
      boardId: boardId || movedCard.boardId,
      userId: req.user._id,
      action: 'moved task',
      details: `Moved "${movedCard.title}"`,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(boardId || movedCard.boardId).emit('card_moved', {
        cardId,
        sourceListId,
        targetListId,
        newIndex,
        cards: allCards,
      });
      io.to(boardId || movedCard.boardId).emit('activity_logged', activity);
    }

    return res.status(200).json({ card: movedCard, cards: allCards });
  } catch (error) {
    console.error('moveCard error:', error);
    return res.status(500).json({ message: 'Failed to move card.', error: error.message });
  }
};

export const deleteCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { boardId } = req.query;

    const card = await CardStore.getById(cardId);
    await CardStore.delete(cardId);

    const targetBoardId = boardId || (card && card.boardId);

    if (targetBoardId) {
      const activity = await ActivityStore.create({
        boardId: targetBoardId,
        userId: req.user._id,
        action: 'deleted task',
        details: card ? `Deleted "${card.title}"` : 'Deleted task',
      });

      const io = req.app.get('io');
      if (io) {
        io.to(targetBoardId).emit('card_deleted', { cardId, boardId: targetBoardId });
        io.to(targetBoardId).emit('activity_logged', activity);
      }
    }

    return res.status(200).json({ message: 'Card deleted successfully.' });
  } catch (error) {
    console.error('deleteCard error:', error);
    return res.status(500).json({ message: 'Failed to delete card.', error: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required.' });
    }

    const card = await CardStore.getById(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Card not found.' });
    }

    const newComment = {
      id: 'cm_' + Math.random().toString(36).substring(2, 9),
      user: req.user._id,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedComments = [...(card.comments || []), newComment];
    const updatedCard = await CardStore.update(cardId, { comments: updatedComments });

    const activity = await ActivityStore.create({
      boardId: card.boardId,
      userId: req.user._id,
      action: 'commented',
      details: `Commented on "${card.title}"`,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(card.boardId).emit('card_updated', updatedCard);
      io.to(card.boardId).emit('activity_logged', activity);
    }

    return res.status(200).json({ card: updatedCard });
  } catch (error) {
    console.error('addComment error:', error);
    return res.status(500).json({ message: 'Failed to add comment.', error: error.message });
  }
};
