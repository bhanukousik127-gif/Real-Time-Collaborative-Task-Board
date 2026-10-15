import React, { useState } from 'react';
import {
  Star,
  Search,
  Filter,
  UserPlus,
  Palette,
  Trash2,
  Check
} from 'lucide-react';

const BACKGROUND_THEMES = [
  { id: 'gradient-blue', name: 'Ocean Indigo', color: '#1e1b4b' },
  { id: 'gradient-purple', name: 'Cyber Purple', color: '#3b0764' },
  { id: 'gradient-emerald', name: 'Emerald Aurora', color: '#064e3b' },
  { id: 'gradient-sunset', name: 'Sunset Glow', color: '#701a75' },
  { id: 'gradient-midnight', name: 'Midnight Slate', color: '#1e293b' },
];

export const BoardHeader = ({
  board,
  onUpdateBoard,
  onDeleteBoard,
  onInviteMember,
  searchQuery,
  setSearchQuery,
  priorityFilter,
  setPriorityFilter,
  allUsers = []
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(board ? board.title : '');
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedUserToInvite, setSelectedUserToInvite] = useState('');

  if (!board) return null;

  const handleTitleSubmit = (e) => {
    e.preventDefault();
    if (title.trim() && title !== board.title) {
      onUpdateBoard({ title: title.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleToggleStar = () => {
    onUpdateBoard({ isStarred: !board.isStarred });
  };

  const handleSelectTheme = (themeId) => {
    onUpdateBoard({ background: themeId });
    setShowThemePicker(false);
  };

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (selectedUserToInvite) {
      onInviteMember(selectedUserToInvite);
      setSelectedUserToInvite('');
      setShowInviteModal(false);
    }
  };

  // Exclude users already members of this board
  const existingMemberIds = (board.members || []).map((m) =>
    typeof m.user === 'object' ? m.user._id : m.user
  );
  const inviteCandidates = allUsers.filter((u) => !existingMemberIds.includes(u._id));

  return (
    <div className="board-header">
      {/* Board Title & Star */}
      <div className="board-title-group">
        {isEditingTitle ? (
          <form onSubmit={handleTitleSubmit}>
            <input
              type="text"
              className="board-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              autoFocus
            />
          </form>
        ) : (
          <h1
            className="board-title-input"
            onClick={() => {
              setTitle(board.title);
              setIsEditingTitle(true);
            }}
            title="Click to rename board"
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {board.title}
          </h1>
        )}

        <button
          className="btn btn-ghost btn-icon"
          onClick={handleToggleStar}
          title={board.isStarred ? 'Starred' : 'Star board'}
        >
          <Star
            size={18}
            fill={board.isStarred ? '#f59e0b' : 'none'}
            color={board.isStarred ? '#f59e0b' : 'var(--text-secondary)'}
          />
        </button>

        {/* Theme Picker */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowThemePicker(!showThemePicker)}
            title="Change background theme"
          >
            <Palette size={14} /> Theme
          </button>

          {showThemePicker && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                width: 220,
                background: 'rgba(23, 31, 48, 0.98)',
                backdropFilter: 'blur(16px)',
                border: '1px solid var(--border-highlight)',
                borderRadius: 'var(--radius-md)',
                padding: '10px',
                zIndex: 100,
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>
                CHOOSE THEME
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {BACKGROUND_THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTheme(t.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#fff',
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          background: t.color,
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                        }}
                      />
                      <span>{t.name}</span>
                    </div>
                    {board.background === t.id && <Check size={14} color="#6366f1" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Invite Member Button */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setShowInviteModal(true)}
        >
          <UserPlus size={14} /> Invite
        </button>

        {/* Delete Board */}
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => {
            if (window.confirm(`Are you sure you want to delete board "${board.title}"?`)) {
              onDeleteBoard(board._id);
            }
          }}
          title="Delete board"
          style={{ color: '#f87171' }}
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Filters & Search */}
      <div className="board-filters">
        <div className="search-input-box">
          <Search size={14} />
          <input
            type="text"
            className="search-input"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="all">All Priorities</option>
          <option value="urgent">🔥 Urgent</option>
          <option value="high">⚡ High</option>
          <option value="medium">● Medium</option>
          <option value="low">✓ Low</option>
        </select>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowInviteModal(false)}
        >
          <div
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-highlight)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              width: 380,
              maxWidth: '90vw',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>Invite Collaborator</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Select a team member to invite to this board for real-time collaboration.
            </p>

            {inviteCandidates.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                All available users are already members of this board.
              </p>
            ) : (
              <form onSubmit={handleInviteSubmit}>
                <select
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    marginBottom: 16,
                  }}
                  value={selectedUserToInvite}
                  onChange={(e) => setSelectedUserToInvite(e.target.value)}
                  required
                >
                  <option value="">Select a user...</option>
                  {inviteCandidates.map((u) => (
                    <option key={u._id} value={u._id} style={{ background: '#1e293b' }}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowInviteModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Invite Collaborator
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
