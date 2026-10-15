import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Calendar,
  CheckSquare,
  Tag,
  User,
  Trash2,
  MessageSquare,
  Clock,
  Send,
  Plus
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const PRESET_LABEL_COLORS = [
  { text: 'Frontend', color: '#10b981' },
  { text: 'Backend', color: '#3b82f6' },
  { text: 'Realtime', color: '#8b5cf6' },
  { text: 'Security', color: '#ef4444' },
  { text: 'Core Feature', color: '#f59e0b' },
  { text: 'Design', color: '#ec4899' },
  { text: 'DevOps', color: '#06b6d4' },
];

export const CardDetailModal = ({
  card,
  boardId,
  lists = [],
  allUsers = [],
  isOpen,
  onClose,
  onUpdateCard,
  onDeleteCard,
  onAddComment,
}) => {
  const dialogRef = useRef(null);
  const { user } = useAuth();
  const { notifyCardFocus, notifyCardBlur } = useSocket();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [listId, setListId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [labels, setLabels] = useState([]);
  const [assignedTo, setAssignedTo] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [newCustomLabel, setNewCustomLabel] = useState('');

  // Synchronize state when card changes
  useEffect(() => {
    if (card && isOpen) {
      setTitle(card.title || '');
      setDescription(card.description || '');
      setPriority(card.priority || 'medium');
      setListId(card.listId || '');
      setDueDate(card.dueDate ? card.dueDate.slice(0, 10) : '');
      setLabels(card.labels || []);
      setAssignedTo(
        (card.assignedTo || []).map((u) => (typeof u === 'object' ? u._id : u))
      );
      setChecklist(card.checklist || []);

      // Notify socket that user is focusing this card
      notifyCardFocus(boardId, card._id);
    }

    return () => {
      if (card && isOpen) {
        notifyCardBlur(boardId, card._id);
      }
    };
  }, [card, isOpen]);

  // Handle native <dialog> open/close
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  // Fallback light-dismiss logic per modern-web-guidance
  const handleDialogClick = (e) => {
    const dialog = dialogRef.current;
    if (e.target === dialog) {
      onClose();
    }
  };

  if (!card) return null;

  const handleSaveField = (updates) => {
    onUpdateCard(card._id, updates);
  };

  // Checklist Actions
  const handleToggleChecklist = (id) => {
    const updated = checklist.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setChecklist(updated);
    handleSaveField({ checklist: updated });
  };

  const handleAddChecklist = (e) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;

    const newItem = {
      id: 'chk_' + Math.random().toString(36).substring(2, 9),
      text: newChecklistText.trim(),
      completed: false,
    };
    const updated = [...checklist, newItem];
    setChecklist(updated);
    setNewChecklistText('');
    handleSaveField({ checklist: updated });
  };

  const handleDeleteChecklist = (id) => {
    const updated = checklist.filter((item) => item.id !== id);
    setChecklist(updated);
    handleSaveField({ checklist: updated });
  };

  // Label Actions
  const handleTogglePresetLabel = (preset) => {
    const exists = labels.some((l) => l.text.toLowerCase() === preset.text.toLowerCase());
    let updated;
    if (exists) {
      updated = labels.filter((l) => l.text.toLowerCase() !== preset.text.toLowerCase());
    } else {
      updated = [...labels, { id: 'lbl_' + Date.now(), text: preset.text, color: preset.color }];
    }
    setLabels(updated);
    handleSaveField({ labels: updated });
  };

  // Assignee Actions
  const handleToggleAssignee = (userId) => {
    const exists = assignedTo.includes(userId);
    let updated;
    if (exists) {
      updated = assignedTo.filter((id) => id !== userId);
    } else {
      updated = [...assignedTo, userId];
    }
    setAssignedTo(updated);
    handleSaveField({ assignedTo: updated });
  };

  // Comment Actions
  const handlePostComment = (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    onAddComment(card._id, newCommentText.trim());
    setNewCommentText('');
  };

  // Progress calculations
  const totalItems = checklist.length;
  const completedItems = checklist.filter((i) => i.completed).length;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-labelledby="cardModalTitle"
      onClick={handleDialogClick}
      onCancel={onClose}
    >
      <div className="modal-content">
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ flex: 1, paddingRight: 16 }}>
            <input
              id="cardModalTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => handleSaveField({ title })}
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                background: 'transparent',
                border: '1px solid transparent',
                borderRadius: 'var(--radius-sm)',
                color: '#fff',
                width: '100%',
                padding: '4px 6px',
                outline: 'none',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
            />
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2, paddingLeft: 6 }}>
              in column{' '}
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                {lists.find((l) => l._id === card.listId)?.title || 'Column'}
              </span>
            </div>
          </div>

          <button
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            title="Close dialog (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body Grid */}
        <div className="modal-body">
          <div className="modal-grid">
            {/* Left Main Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Description Section */}
              <div>
                <label className="sidebar-section-title">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => handleSaveField({ description })}
                  placeholder="Add a detailed description, technical specs, or acceptance criteria..."
                  style={{
                    width: '100%',
                    minHeight: 110,
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem',
                    lineHeight: 1.5,
                    outline: 'none',
                    resize: 'vertical',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                />
              </div>

              {/* Checklist Section */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckSquare size={16} color="var(--primary)" />
                    <span className="sidebar-section-title" style={{ margin: 0 }}>
                      Checklist ({completedItems}/{totalItems})
                    </span>
                  </div>
                  {totalItems > 0 && (
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#a5b4fc' }}>
                      {progressPercent}%
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                {totalItems > 0 && (
                  <div
                    style={{
                      height: 6,
                      background: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                      marginBottom: 14,
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${progressPercent}%`,
                        background: progressPercent === 100 ? '#10b981' : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                        transition: 'width 0.3s ease-out',
                      }}
                    />
                  </div>
                )}

                {/* Checklist Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                  {checklist.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'rgba(255, 255, 255, 0.02)',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => handleToggleChecklist(item.id)}
                          style={{ width: 16, height: 16, accentColor: 'var(--primary)', cursor: 'pointer' }}
                        />
                        <span
                          style={{
                            fontSize: '0.88rem',
                            color: item.completed ? 'var(--text-muted)' : 'var(--text-main)',
                            textDecoration: item.completed ? 'line-through' : 'none',
                          }}
                        >
                          {item.text}
                        </span>
                      </label>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleDeleteChecklist(item.id)}
                        style={{ padding: 4, color: 'var(--text-muted)' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Checklist Form */}
                <form onSubmit={handleAddChecklist} style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Add an item to checklist..."
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    style={{
                      flex: 1,
                      background: 'var(--bg-glass)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '8px 12px',
                      color: 'var(--text-main)',
                      fontSize: '0.84rem',
                      outline: 'none',
                    }}
                  />
                  <button type="submit" className="btn btn-secondary btn-sm">
                    <Plus size={14} /> Add
                  </button>
                </form>
              </div>

              {/* Comments Section */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <MessageSquare size={16} color="var(--primary)" />
                  <span className="sidebar-section-title" style={{ margin: 0 }}>Activity & Comments</span>
                </div>

                {/* Comment Input */}
                <form onSubmit={handlePostComment} style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div
                      className="avatar-bubble"
                      style={{
                        background: user ? user.color : '#6366f1',
                        width: 32,
                        height: 32,
                        flexShrink: 0,
                      }}
                    >
                      {user ? user.name.slice(0, 2).toUpperCase() : 'ME'}
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <textarea
                        placeholder="Write a comment or status update..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        style={{
                          width: '100%',
                          minHeight: 65,
                          background: 'var(--bg-glass)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: '10px 12px',
                          color: 'var(--text-main)',
                          fontSize: '0.84rem',
                          outline: 'none',
                          resize: 'none',
                        }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="submit"
                          className="btn btn-primary btn-sm"
                          disabled={!newCommentText.trim()}
                        >
                          <Send size={13} /> Post Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                {/* Comments List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(card.comments || []).map((cm) => {
                    const authorName = typeof cm.user === 'object' ? cm.user.name : 'Team Member';
                    const authorAvatar = typeof cm.user === 'object' ? cm.user.avatar : '';
                    const authorColor = typeof cm.user === 'object' ? cm.user.color : '#6366f1';
                    return (
                      <div
                        key={cm.id || cm._id}
                        style={{
                          display: 'flex',
                          gap: 10,
                          background: 'rgba(255, 255, 255, 0.02)',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div
                          className="avatar-bubble"
                          style={{
                            background: authorColor,
                            width: 28,
                            height: 28,
                            flexShrink: 0,
                            fontSize: '0.68rem',
                          }}
                        >
                          {authorAvatar ? (
                            <img src={authorAvatar} alt={authorName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            authorName.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                            <span style={{ fontWeight: 600, fontSize: '0.82rem', color: '#fff' }}>{authorName}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              {new Date(cm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.84rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                            {cm.text}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Sidebar Controls */}
            <div className="modal-sidebar">
              {/* Priority Selector */}
              <div>
                <label className="sidebar-section-title">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => {
                    setPriority(e.target.value);
                    handleSaveField({ priority: e.target.value });
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    fontSize: '0.84rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="low" style={{ background: '#1e293b' }}>✓ Low</option>
                  <option value="medium" style={{ background: '#1e293b' }}>● Medium</option>
                  <option value="high" style={{ background: '#1e293b' }}>⚡ High</option>
                  <option value="urgent" style={{ background: '#1e293b' }}>🔥 Urgent</option>
                </select>
              </div>

              {/* Move to Column */}
              <div>
                <label className="sidebar-section-title">Column</label>
                <select
                  value={listId}
                  onChange={(e) => {
                    const newListId = e.target.value;
                    setListId(newListId);
                    handleSaveField({ listId: newListId });
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    fontSize: '0.84rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {lists.map((l) => (
                    <option key={l._id} value={l._id} style={{ background: '#1e293b' }}>
                      {l.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label className="sidebar-section-title">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    handleSaveField({ dueDate: e.target.value ? new Date(e.target.value).toISOString() : null });
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    fontSize: '0.84rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Labels */}
              <div>
                <label className="sidebar-section-title">Labels</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {PRESET_LABEL_COLORS.map((preset) => {
                    const isSelected = labels.some((l) => l.text.toLowerCase() === preset.text.toLowerCase());
                    return (
                      <button
                        key={preset.text}
                        type="button"
                        onClick={() => handleTogglePresetLabel(preset)}
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-full)',
                          background: isSelected ? `${preset.color}33` : 'rgba(255, 255, 255, 0.05)',
                          border: `1px solid ${isSelected ? preset.color : 'rgba(255, 255, 255, 0.1)'}`,
                          color: isSelected ? preset.color : 'var(--text-secondary)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {isSelected && '✓ '}
                        {preset.text}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Assign Members */}
              <div>
                <label className="sidebar-section-title">Assign Members</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {allUsers.map((u) => {
                    const isAssigned = assignedTo.includes(u._id);
                    return (
                      <button
                        key={u._id}
                        type="button"
                        onClick={() => handleToggleAssignee(u._id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: isAssigned ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                          border: 'none',
                          color: isAssigned ? '#a5b4fc' : 'var(--text-secondary)',
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div
                            className="avatar-bubble"
                            style={{
                              background: u.color || '#6366f1',
                              width: 22,
                              height: 22,
                              fontSize: '0.62rem',
                            }}
                          >
                            {u.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span>{u.name}</span>
                        </div>
                        {isAssigned && <span style={{ color: '#6366f1', fontWeight: 700 }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Delete Card Action */}
              <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => {
                    if (window.confirm(`Delete card "${card.title}"?`)) {
                      onDeleteCard(card._id);
                      onClose();
                    }
                  }}
                >
                  <Trash2 size={14} /> Delete Task
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
};
