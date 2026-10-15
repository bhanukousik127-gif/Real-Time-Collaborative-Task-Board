import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  Kanban,
  Plus,
  Activity,
  ChevronDown,
  LogOut,
  Users,
  Wifi,
  WifiOff,
  UserCheck
} from 'lucide-react';

export const Navbar = ({
  boards = [],
  currentBoard,
  onSelectBoard,
  onOpenCreateBoard,
  onToggleActivity,
  activityCount = 0
}) => {
  const { user, logout, login } = useAuth();
  const { connected, activeCollaborators } = useSocket();
  const [showBoardMenu, setShowBoardMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const demoUsers = [
    { name: 'Alex Morgan', email: 'alex@example.com', color: '#6366f1' },
    { name: 'Sarah Chen', email: 'sarah@example.com', color: '#ec4899' },
    { name: 'David Kim', email: 'david@example.com', color: '#10b981' },
  ];

  const handleQuickSwitch = async (email) => {
    try {
      await login(email, 'password123');
      setShowUserMenu(false);
    } catch (err) {
      console.error('Quick switch failed:', err);
    }
  };

  return (
    <header className="navbar">
      {/* Brand & Board Switcher */}
      <div className="nav-brand">
        <div className="brand-icon-box">
          <Kanban size={22} />
        </div>
        <div>
          <span className="brand-title">SyncBoard</span>
          <span className="brand-badge" style={{ marginLeft: 8 }}>REAL-TIME</span>
        </div>

        {/* Board Switcher Dropdown */}
        <div style={{ position: 'relative', marginLeft: 16 }}>
          <button
            className="board-selector-btn"
            onClick={() => setShowBoardMenu(!showBoardMenu)}
          >
            <span>{currentBoard ? currentBoard.title : 'Select Board'}</span>
            <ChevronDown size={14} />
          </button>

          {showBoardMenu && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                width: 260,
                background: 'rgba(23, 31, 48, 0.98)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--border-highlight)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '8px',
                zIndex: 100,
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', padding: '6px 8px' }}>
                YOUR BOARDS
              </div>
              {boards.map((b) => (
                <button
                  key={b._id}
                  onClick={() => {
                    onSelectBoard(b._id);
                    setShowBoardMenu(false);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: currentBoard && currentBoard._id === b._id ? 'var(--primary-light)' : 'transparent',
                    color: currentBoard && currentBoard._id === b._id ? '#a5b4fc' : 'var(--text-main)',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>{b.title.split(' ')[0] || '📋'}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {b.title}
                  </span>
                </button>
              ))}

              <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 6, paddingTop: 6 }}>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => {
                    setShowBoardMenu(false);
                    onOpenCreateBoard();
                  }}
                >
                  <Plus size={14} /> Create New Board
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Collaborator Presence, Activity Feed, User Profile */}
      <div className="nav-right">
        {/* Connection status indicator */}
        <div
          title={connected ? 'Real-time WebSocket connected' : 'Connecting to real-time server...'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.74rem',
            color: connected ? '#34d399' : '#f59e0b',
            background: connected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            padding: '4px 8px',
            borderRadius: 'var(--radius-full)',
            border: `1px solid ${connected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
          }}
        >
          {connected ? <Wifi size={13} /> : <WifiOff size={13} />}
          <span>{connected ? 'Live Sync' : 'Reconnecting'}</span>
        </div>

        {/* Active Collaborator Presence Avatar Stack */}
        {activeCollaborators.length > 0 && (
          <div className="presence-pill" title={`${activeCollaborators.length} collaborator(s) viewing this board`}>
            <span className="presence-dot"></span>
            <span>{activeCollaborators.length} Online</span>
            <div className="avatar-stack">
              {activeCollaborators.map((c) => (
                <div
                  key={c._id}
                  className="avatar-bubble"
                  style={{ background: c.color || '#6366f1' }}
                  title={`${c.name} (${c.email})`}
                >
                  {c.avatar ? (
                    <img src={c.avatar} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    c.name.slice(0, 2).toUpperCase()
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Feed Toggle */}
        <button
          className="btn btn-secondary btn-icon"
          onClick={onToggleActivity}
          title="Board Activity History"
          style={{ position: 'relative' }}
        >
          <Activity size={18} />
          {activityCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--accent-pink)',
              }}
            />
          )}
        </button>

        {/* User Profile & Demo Switcher */}
        {user && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 6px',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div
                className="avatar-bubble"
                style={{
                  background: user.color || '#6366f1',
                  width: 34,
                  height: 34,
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user.name.slice(0, 2).toUpperCase()
                )}
              </div>
              <ChevronDown size={14} color="var(--text-secondary)" />
            </button>

            {showUserMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: 260,
                  background: 'rgba(23, 31, 48, 0.98)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid var(--border-highlight)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '12px',
                  zIndex: 100,
                }}
              >
                <div style={{ marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff' }}>{user.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user.email}</div>
                </div>

                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                  SWITCH DEMO USER (FOR COLLAB TESTING)
                </div>

                {demoUsers.map((du) => (
                  <button
                    key={du.email}
                    onClick={() => handleQuickSwitch(du.email)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 8px',
                      borderRadius: 'var(--radius-sm)',
                      background: user.email === du.email ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                      color: user.email === du.email ? '#a5b4fc' : 'var(--text-secondary)',
                      border: 'none',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: du.color,
                        }}
                      />
                      {du.name}
                    </span>
                    {user.email === du.email && <UserCheck size={14} />}
                  </button>
                ))}

                <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 8, paddingTop: 8 }}>
                  <button
                    onClick={logout}
                    className="btn btn-ghost btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start', color: '#f87171' }}
                  >
                    <LogOut size={14} /> Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
