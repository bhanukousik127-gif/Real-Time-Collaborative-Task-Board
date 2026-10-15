import React, { useState, useEffect } from 'react';
import { ListColumn } from './ListColumn';
import { CardDetailModal } from './CardDetailModal';
import { useSocket } from '../context/SocketContext';
import { api } from '../services/api';
import { Plus, X } from 'lucide-react';

export const BoardView = ({
  board,
  lists,
  cards,
  setLists,
  setCards,
  searchQuery,
  priorityFilter,
  allUsers,
  onActivityLogged,
}) => {
  const { socket, joinBoard, leaveBoard } = useSocket();
  const [selectedCard, setSelectedCard] = useState(null);
  const [showAddList, setShowAddList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  // Join the board's WebSocket room on mount or board change
  useEffect(() => {
    if (!board || !board._id) return;

    joinBoard(board._id);

    return () => {
      leaveBoard(board._id);
    };
  }, [board?._id]);

  // Set up real-time WebSocket event listeners
  useEffect(() => {
    if (!socket || !board) return;

    const handleCardCreated = (newCard) => {
      if (newCard.boardId === board._id) {
        setCards((prev) => {
          if (prev.some((c) => c._id === newCard._id)) return prev;
          return [...prev, newCard];
        });
      }
    };

    const handleCardUpdated = (updatedCard) => {
      if (updatedCard.boardId === board._id) {
        setCards((prev) =>
          prev.map((c) => (c._id === updatedCard._id ? updatedCard : c))
        );
        setSelectedCard((prev) =>
          prev && prev._id === updatedCard._id ? updatedCard : prev
        );
      }
    };

    const handleCardMoved = ({ cards: newCards, cardId }) => {
      if (newCards && Array.isArray(newCards)) {
        setCards(newCards);
      }
    };

    const handleCardDeleted = ({ cardId, boardId }) => {
      if (boardId === board._id) {
        setCards((prev) => prev.filter((c) => c._id !== cardId));
        setSelectedCard((prev) => (prev && prev._id === cardId ? null : prev));
      }
    };

    const handleListCreated = (newList) => {
      if (newList.boardId === board._id) {
        setLists((prev) => {
          if (prev.some((l) => l._id === newList._id)) return prev;
          return [...prev, newList].sort((a, b) => a.order - b.order);
        });
      }
    };

    const handleListUpdated = (updatedList) => {
      if (updatedList.boardId === board._id) {
        setLists((prev) =>
          prev.map((l) => (l._id === updatedList._id ? updatedList : l))
        );
      }
    };

    const handleListDeleted = ({ listId, boardId: bId }) => {
      if (bId === board._id) {
        setLists((prev) => prev.filter((l) => l._id !== listId));
        setCards((prev) => prev.filter((c) => c.listId !== listId));
      }
    };

    const handleActivityLogged = (act) => {
      if (act && act.boardId === board._id && onActivityLogged) {
        onActivityLogged(act);
      }
    };

    socket.on('card_created', handleCardCreated);
    socket.on('card_updated', handleCardUpdated);
    socket.on('card_moved', handleCardMoved);
    socket.on('card_deleted', handleCardDeleted);
    socket.on('list_created', handleListCreated);
    socket.on('list_updated', handleListUpdated);
    socket.on('list_deleted', handleListDeleted);
    socket.on('activity_logged', handleActivityLogged);

    return () => {
      socket.off('card_created', handleCardCreated);
      socket.off('card_updated', handleCardUpdated);
      socket.off('card_moved', handleCardMoved);
      socket.off('card_deleted', handleCardDeleted);
      socket.off('list_created', handleListCreated);
      socket.off('list_updated', handleListUpdated);
      socket.off('list_deleted', handleListDeleted);
      socket.off('activity_logged', handleActivityLogged);
    };
  }, [socket, board?._id]);

  // Card Operations
  const handleCreateCard = async ({ listId, title }) => {
    try {
      const res = await api.createCard({
        boardId: board._id,
        listId,
        title,
      });
      // Optimistic update
      setCards((prev) => {
        if (prev.some((c) => c._id === res.card._id)) return prev;
        return [...prev, res.card];
      });
    } catch (err) {
      console.error('Failed to create card:', err);
    }
  };

  const handleUpdateCard = async (cardId, updates) => {
    try {
      // Optimistic update
      setCards((prev) =>
        prev.map((c) => (c._id === cardId ? { ...c, ...updates } : c))
      );
      if (selectedCard && selectedCard._id === cardId) {
        setSelectedCard((prev) => ({ ...prev, ...updates }));
      }
      await api.updateCard(cardId, updates);
    } catch (err) {
      console.error('Failed to update card:', err);
    }
  };

  const handleMoveCard = async ({ cardId, sourceListId, targetListId, newIndex }) => {
    try {
      // Optimistic local update
      setCards((prev) => {
        const cardToMove = prev.find((c) => c._id === cardId);
        if (!cardToMove) return prev;

        const otherCards = prev.filter((c) => c._id !== cardId);
        const updatedMovedCard = { ...cardToMove, listId: targetListId };

        const targetCards = otherCards.filter((c) => c.listId === targetListId);
        targetCards.splice(newIndex, 0, updatedMovedCard);

        return [
          ...otherCards.filter((c) => c.listId !== targetListId),
          ...targetCards,
        ];
      });

      // Send to server
      const res = await api.moveCard(cardId, {
        sourceListId,
        targetListId,
        newIndex,
        boardId: board._id,
      });

      if (res.cards) {
        setCards(res.cards);
      }
    } catch (err) {
      console.error('Failed to move card:', err);
    }
  };

  const handleDeleteCard = async (cardId) => {
    try {
      setCards((prev) => prev.filter((c) => c._id !== cardId));
      setSelectedCard(null);
      await api.deleteCard(cardId, board._id);
    } catch (err) {
      console.error('Failed to delete card:', err);
    }
  };

  const handleAddComment = async (cardId, text) => {
    try {
      const res = await api.addComment(cardId, text);
      if (res.card) {
        setCards((prev) => prev.map((c) => (c._id === cardId ? res.card : c)));
        if (selectedCard && selectedCard._id === cardId) {
          setSelectedCard(res.card);
        }
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  // List Operations
  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    try {
      const res = await api.createList({
        boardId: board._id,
        title: newListTitle.trim(),
      });
      setLists((prev) => [...prev, res.list]);
      setNewListTitle('');
      setShowAddList(false);
    } catch (err) {
      console.error('Failed to create list:', err);
    }
  };

  const handleUpdateList = async (listId, updates) => {
    try {
      setLists((prev) =>
        prev.map((l) => (l._id === listId ? { ...l, ...updates } : l))
      );
      await api.updateList(listId, updates);
    } catch (err) {
      console.error('Failed to update list:', err);
    }
  };

  const handleDeleteList = async (listId) => {
    try {
      setLists((prev) => prev.filter((l) => l._id !== listId));
      setCards((prev) => prev.filter((c) => c.listId !== listId));
      await api.deleteList(listId, board._id);
    } catch (err) {
      console.error('Failed to delete list:', err);
    }
  };

  // Filter cards by search & priority
  const filteredCards = cards.filter((card) => {
    const matchesSearch =
      !searchQuery ||
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (card.description && card.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPriority =
      priorityFilter === 'all' || card.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  return (
    <main className="board-canvas">
      {lists.map((list) => {
        const columnCards = filteredCards
          .filter((card) => card.listId === list._id)
          .sort((a, b) => a.order - b.order);

        return (
          <ListColumn
            key={list._id}
            list={list}
            cards={columnCards}
            onUpdateList={handleUpdateList}
            onDeleteList={handleDeleteList}
            onCreateCard={handleCreateCard}
            onCardClick={(card) => setSelectedCard(card)}
            onMoveCard={handleMoveCard}
          />
        );
      })}

      {/* Add New List Column */}
      <div style={{ minWidth: 280 }}>
        {showAddList ? (
          <form
            onSubmit={handleCreateList}
            style={{
              background: 'var(--bg-column)',
              backdropFilter: 'blur(14px)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '14px',
              width: 280,
            }}
          >
            <input
              type="text"
              placeholder="Enter column title..."
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
                fontSize: '0.88rem',
                outline: 'none',
                marginBottom: 10,
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button type="submit" className="btn btn-primary btn-sm">
                Add Column
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setShowAddList(false);
                  setNewListTitle('');
                }}
              >
                <X size={15} />
              </button>
            </div>
          </form>
        ) : (
          <button
            className="add-list-column-btn"
            onClick={() => setShowAddList(true)}
          >
            <Plus size={16} /> Add another column
          </button>
        )}
      </div>

      {/* Card Detail Modal */}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          boardId={board._id}
          lists={lists}
          allUsers={allUsers}
          isOpen={!!selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdateCard={handleUpdateCard}
          onDeleteCard={handleDeleteCard}
          onAddComment={handleAddComment}
        />
      )}
    </main>
  );
};
