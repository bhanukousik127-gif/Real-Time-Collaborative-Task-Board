import React from 'react';
import {
  Calendar,
  CheckSquare,
  MessageSquare,
  AlertCircle,
  Eye
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export const TaskCard = ({ card, onClick, onDragStart, onDragEnd }) => {
  const { focusedCards } = useSocket();
  const activeFocusUser = focusedCards[card._id];

  // Checklist completion stats
  const totalChecklist = (card.checklist || []).length;
  const completedChecklist = (card.checklist || []).filter((item) => item.completed).length;

  // Due Date calculation
  let dueDateText = null;
  let isOverdue = false;
  if (card.dueDate) {
    const due = new Date(card.dueDate);
    const now = new Date();
    isOverdue = due < now;
    dueDateText = due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  const priorityStyles = {
    low: { label: 'Low', className: 'priority-low' },
    medium: { label: 'Medium', className: 'priority-medium' },
    high: { label: 'High', className: 'priority-high' },
    urgent: { label: 'Urgent', className: 'priority-urgent' },
  };

  const currentPriority = priorityStyles[card.priority] || priorityStyles.medium;

  return (
    <div
      className={`task-card ${activeFocusUser ? 'card-collaborator-focus' : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, card)}
      onDragEnd={onDragEnd}
      onClick={() => onClick(card)}
      style={{
        ...(activeFocusUser && {
          outline: `2px solid ${activeFocusUser.color || '#ec4899'}`,
          boxShadow: `0 0 14px ${activeFocusUser.color || '#ec4899'}55`,
        }),
      }}
    >
      {/* Active collaborator badge if someone is viewing/editing */}
      {activeFocusUser && (
        <div
          style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: activeFocusUser.color || '#ec4899',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            marginBottom: 2,
          }}
        >
          <Eye size={12} /> {activeFocusUser.name} is editing
        </div>
      )}

      {/* Labels */}
      {card.labels && card.labels.length > 0 && (
        <div className="card-labels">
          {card.labels.map((lbl, idx) => (
            <span
              key={lbl.id || idx}
              className="card-label"
              style={{
                backgroundColor: `${lbl.color}22`,
                color: lbl.color,
                border: `1px solid ${lbl.color}44`,
              }}
            >
              {lbl.text}
            </span>
          ))}
        </div>
      )}

      {/* Card Title */}
      <h4 className="card-title">{card.title}</h4>

      {/* Card Meta Footer */}
      <div className="card-footer">
        <div className="card-badges">
          {/* Priority */}
          <span className={`priority-tag ${currentPriority.className}`}>
            {card.priority === 'urgent' && '🔥 '}
            {currentPriority.label}
          </span>

          {/* Checklist progress */}
          {totalChecklist > 0 && (
            <span
              className={`badge-item ${completedChecklist === totalChecklist ? 'checklist-done' : ''}`}
              style={{
                color: completedChecklist === totalChecklist ? '#34d399' : 'var(--text-secondary)',
              }}
              title={`Checklist: ${completedChecklist} of ${totalChecklist} completed`}
            >
              <CheckSquare size={13} />
              <span>{completedChecklist}/{totalChecklist}</span>
            </span>
          )}

          {/* Due date */}
          {dueDateText && (
            <span
              className={`badge-item ${isOverdue ? 'overdue' : ''}`}
              title={isOverdue ? 'Task is overdue!' : `Due ${dueDateText}`}
            >
              {isOverdue ? <AlertCircle size={13} /> : <Calendar size={13} />}
              <span>{dueDateText}</span>
            </span>
          )}

          {/* Comments count */}
          {card.comments && card.comments.length > 0 && (
            <span className="badge-item" title={`${card.comments.length} comment(s)`}>
              <MessageSquare size={13} />
              <span>{card.comments.length}</span>
            </span>
          )}
        </div>

        {/* Assigned Member Avatars */}
        {card.assignedTo && card.assignedTo.length > 0 && (
          <div className="avatar-stack">
            {card.assignedTo.map((u, idx) => {
              const userName = typeof u === 'object' ? u.name : 'User';
              const userColor = typeof u === 'object' ? u.color : '#6366f1';
              const userAvatar = typeof u === 'object' ? u.avatar : '';
              return (
                <div
                  key={u._id || idx}
                  className="avatar-bubble"
                  style={{
                    background: userColor,
                    width: 24,
                    height: 24,
                    fontSize: '0.65rem',
                  }}
                  title={userName}
                >
                  {userAvatar ? (
                    <img src={userAvatar} alt={userName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    userName.slice(0, 2).toUpperCase()
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
