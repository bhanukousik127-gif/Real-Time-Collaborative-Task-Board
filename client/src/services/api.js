const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('taskboard_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'An unexpected error occurred.');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),
  getUsers: () => request('/auth/users'),

  // Boards
  getBoards: () => request('/boards'),
  getBoard: (boardId) => request(`/boards/${boardId}`),
  createBoard: (data) => request('/boards', { method: 'POST', body: JSON.stringify(data) }),
  updateBoard: (boardId, data) => request(`/boards/${boardId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBoard: (boardId) => request(`/boards/${boardId}`, { method: 'DELETE' }),
  addBoardMember: (boardId, userId, role) =>
    request(`/boards/${boardId}/members`, { method: 'POST', body: JSON.stringify({ userId, role }) }),

  // Lists
  createList: (data) => request('/lists', { method: 'POST', body: JSON.stringify(data) }),
  updateList: (listId, data) => request(`/lists/${listId}`, { method: 'PUT', body: JSON.stringify(data) }),
  reorderLists: (boardId, orderedListIds) =>
    request('/lists/reorder', { method: 'POST', body: JSON.stringify({ boardId, orderedListIds }) }),
  deleteList: (listId, boardId) => request(`/lists/${listId}?boardId=${boardId}`, { method: 'DELETE' }),

  // Cards
  createCard: (data) => request('/cards', { method: 'POST', body: JSON.stringify(data) }),
  updateCard: (cardId, data) => request(`/cards/${cardId}`, { method: 'PUT', body: JSON.stringify(data) }),
  moveCard: (cardId, moveData) => request(`/cards/${cardId}/move`, { method: 'POST', body: JSON.stringify(moveData) }),
  deleteCard: (cardId, boardId) => request(`/cards/${cardId}?boardId=${boardId}`, { method: 'DELETE' }),
  addComment: (cardId, text) => request(`/cards/${cardId}/comments`, { method: 'POST', body: JSON.stringify({ text }) }),

  // Activities
  getActivities: (boardId) => request(`/activities/${boardId}`),
};
