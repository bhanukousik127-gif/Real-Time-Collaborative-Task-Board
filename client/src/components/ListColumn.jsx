import React, { useState } from 'react';
import { TaskCard } from './TaskCard';
import { Plus, MoreHorizontal, Trash2, X, Check } from 'lucide-react';

export const ListColumn = ({
  list,
  cards = [],
  onUpdateList,
  onDeleteList,
  onCreateCard,
  onCardClick,
  onMoveCard,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleTitleSubmit = (e) => {
    e.preventDefault();
    if (title.trim() && title !== list.title) {
      onUpdateList(list._id, { title: title.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleQuickAddSubmit = (e) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;

    onCreateCard({
      listId: list._id,
      title: newCardTitle.trim(),
    });

    setNewCardTitle('');
    setShowQuickAdd(false);
  };

  // Drag and Drop Event Handlers
  const handleDragStart = (e, card) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      cardId: card._id,
      sourceListId: list._id,
    }));
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('is-dragging');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('is-dragging');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    // Only remove if leaving the container itself
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      const { cardId, sourceListId } = JSON.parse(dataStr);

      // Determine drop index by checking card positions
      const cardElements = Array.from(e.currentTarget.querySelectorAll('.task-card'));
      let newIndex = cardElements.length;

      for (let i = 0; i < cardElements.length; i++) {
        const rect = cardElements[i].getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        if (e.clientY < midY) {
          newIndex = i;
          break;
        }
      }

      onMoveCard({
        cardId,
        sourceListId,
        targetListId: list._id,
        newIndex,
      });
    } catch (err) {
      console.error('Drop error:', err);
    }
  };

  return (
    <div className={`board-column ${isDragOver ? 'is-drag-over' : ''}`}>
      {/* Column Header */}
      <div className="column-header">
        <div className="column-header-left">
          {isEditingTitle ? (
            <form onSubmit={handleTitleSubmit} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                autoFocus
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--primary)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '2px 6px',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.94rem',
                  outline: 'none',
                }}
              />
            </form>
          ) : (
            <div
              className="column-title"
              onClick={() => setIsEditingTitle(true)}
              title="Click to rename"
              style={{ cursor: 'pointer' }}
            >
              {list.title}
            </div>
          )}
          <span className="column-count">{cards.length}</span>
        </div>

        {/* Options Menu */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-ghost btn-icon"
            style={{ width: 28, height: 28 }}
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreHorizontal size={16} />
          </button>

          {showMenu && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                right: 0,
                width: 170,
                background: 'rgba(23, 31, 48, 0.98)',
                backdropFilter: 'blur(16px)',
                border: '1px solid var(--border-highlight)',
                borderRadius: 'var(--radius-md)',
                padding: '6px',
                zIndex: 50,
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <button
                onClick={() => {
                  setShowMenu(false);
                  setIsEditingTitle(true);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '6px 8px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-main)',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                Rename Column
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowQuickAdd(true);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '6px 8px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-main)',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                Add Task
              </button>

              <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '4px 0' }} />

              <button
                onClick={() => {
                  setShowMenu(false);
                  if (window.confirm(`Delete column "${list.title}" and its cards?`)) {
                    onDeleteList(list._id);
                  }
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '6px 8px',
                  background: 'transparent',
                  border: 'none',
                  color: '#f87171',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <Trash2 size={13} /> Delete Column
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Droppable Cards Container */}
      <div
        className={`column-cards-container ${isDragOver ? 'drag-target' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {cards.map((card) => (
          <TaskCard
            key={card._id}
            card={card}
            onClick={onCardClick}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
        ))}

        {cards.length === 0 && !showQuickAdd && (
          <div
            style={{
              padding: '24px 12px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.82rem',
              border: '1px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            Drop tasks here
          </div>
        )}
      </div>

      {/* Quick Add Card Footer */}
      <div className="quick-add-box">
        {showQuickAdd ? (
          <form onSubmit={handleQuickAddSubmit}>
            <textarea
              className="quick-add-input"
              placeholder="Enter task title..."
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleQuickAddSubmit(e);
                }
              }}
              autoFocus
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button type="submit" className="btn btn-primary btn-sm">
                Add Card
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setShowQuickAdd(false);
                  setNewCardTitle('');
                }}
              >
                <X size={15} />
              </button>
            </div>
          </form>
        ) : (
          <button
            className="btn btn-ghost btn-sm"
            style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--text-secondary)' }}
            onClick={() => setShowQuickAdd(true)}
          >
            <Plus size={15} /> Add a task
          </button>
        )}
      </div>
    </div>
  );
};
