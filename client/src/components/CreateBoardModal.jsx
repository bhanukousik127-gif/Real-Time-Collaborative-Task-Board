import React, { useState } from 'react';
import { X, Check, Sparkles } from 'lucide-react';

const BACKGROUND_THEMES = [
  { id: 'gradient-blue', name: 'Ocean Indigo', color: '#1e1b4b', gradient: 'radial-gradient(circle at 10% 20%, #1e1b4b 0%, #0f172a 50%, #090d16 100%)' },
  { id: 'gradient-purple', name: 'Cyber Purple', color: '#3b0764', gradient: 'radial-gradient(circle at 20% 15%, #3b0764 0%, #180d2e 50%, #0b0617 100%)' },
  { id: 'gradient-emerald', name: 'Emerald Aurora', color: '#064e3b', gradient: 'radial-gradient(circle at 15% 15%, #064e3b 0%, #062a22 50%, #031410 100%)' },
  { id: 'gradient-sunset', name: 'Sunset Glow', color: '#701a75', gradient: 'radial-gradient(circle at 20% 10%, #701a75 0%, #311029 40%, #0f0714 100%)' },
  { id: 'gradient-midnight', name: 'Midnight Slate', color: '#1e293b', gradient: 'radial-gradient(circle at 50% 10%, #1e293b 0%, #0f172a 60%, #020617 100%)' },
];

export const CreateBoardModal = ({ isOpen, onClose, onCreateBoard }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [background, setBackground] = useState('gradient-blue');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateBoard({
      title: title.trim(),
      description: description.trim(),
      background,
    });

    setTitle('');
    setDescription('');
    setBackground('gradient-blue');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 8, 15, 0.75)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'fade-in 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 440,
          maxWidth: '92vw',
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-highlight)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          boxShadow: 'var(--shadow-lg)',
          animation: 'scale-up 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Sparkles size={18} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Create New Board
            </h3>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
              BOARD TITLE *
            </label>
            <input
              type="text"
              placeholder="e.g. 🚀 Mobile App Launch or 🎨 Design Sprint"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
              DESCRIPTION (OPTIONAL)
            </label>
            <textarea
              placeholder="What is this board for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                height: 70,
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none',
                resize: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
              CANVAS BACKGROUND THEME
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              {BACKGROUND_THEMES.map((theme) => {
                const isSelected = background === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setBackground(theme.id)}
                    title={theme.name}
                    style={{
                      height: 48,
                      borderRadius: 'var(--radius-md)',
                      background: theme.gradient,
                      border: isSelected ? '2px solid #fff' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      boxShadow: isSelected ? '0 0 12px rgba(255,255,255,0.4)' : 'none',
                      transition: 'transform 0.15s ease',
                      transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                    }}
                  >
                    {isSelected && <Check size={16} color="#fff" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!title.trim()}>
              Create Board
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
