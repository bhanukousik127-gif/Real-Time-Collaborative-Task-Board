import React from 'react';
import { X, Activity, Clock } from 'lucide-react';

export const ActivityDrawer = ({ isOpen, onClose, activities = [] }) => {
  if (!isOpen) return null;

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="activity-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div
          style={{
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Board Activity</h3>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Activities List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          {activities.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No activities recorded yet.
            </div>
          ) : (
            activities.map((act) => {
              const userName = typeof act.user === 'object' ? act.user.name : 'Collaborator';
              const userColor = typeof act.user === 'object' ? act.user.color : '#6366f1';
              const userAvatar = typeof act.user === 'object' ? act.user.avatar : '';

              return (
                <div key={act._id || act.createdAt} className="activity-item">
                  <div
                    className="avatar-bubble"
                    style={{
                      background: userColor,
                      width: 28,
                      height: 28,
                      flexShrink: 0,
                      fontSize: '0.68rem',
                    }}
                  >
                    {userAvatar ? (
                      <img src={userAvatar} alt={userName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      userName.slice(0, 2).toUpperCase()
                    )}
                  </div>

                  <div className="activity-meta">
                    <div style={{ lineHeight: 1.4 }}>
                      <strong style={{ color: '#fff', fontWeight: 600 }}>{userName}</strong>{' '}
                      <span style={{ color: 'var(--text-secondary)' }}>{act.action}</span>
                    </div>
                    {act.details && (
                      <div style={{ color: '#cbd5e1', fontSize: '0.8rem', fontStyle: 'italic', marginTop: 2 }}>
                        {act.details}
                      </div>
                    )}
                    <span className="activity-time">
                      <Clock size={11} style={{ display: 'inline', marginRight: 4 }} />
                      {formatTime(act.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
};
