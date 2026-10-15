import bcrypt from 'bcryptjs';
import { UserModel } from './User.js';
import { BoardModel } from './Board.js';
import { ListModel } from './List.js';
import { CardModel } from './Card.js';
import { ActivityModel } from './Activity.js';
import { getDBStatus } from '../config/db.js';

// In-Memory collections for fallback
const memoryStore = {
  users: [],
  boards: [],
  lists: [],
  cards: [],
  activities: [],
};

const generateId = () => {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
};

// Seed initial memory data if needed
export const seedInitialMemoryStore = async () => {
  if (memoryStore.users.length > 0) return;

  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user1 = {
    _id: 'user_alex',
    name: 'Alex Morgan',
    email: 'alex@example.com',
    password: hashedPassword,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    color: '#6366f1',
    createdAt: new Date().toISOString(),
  };

  const user2 = {
    _id: 'user_sarah',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    password: hashedPassword,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
    color: '#ec4899',
    createdAt: new Date().toISOString(),
  };

  const user3 = {
    _id: 'user_david',
    name: 'David Kim',
    email: 'david@example.com',
    password: hashedPassword,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    color: '#10b981',
    createdAt: new Date().toISOString(),
  };

  memoryStore.users.push(user1, user2, user3);

  const board1 = {
    _id: 'board_sprint',
    title: '🚀 Q4 Product & Engineering Sprint',
    description: 'Quarterly roadmap, architecture refactoring, and real-time collaboration features.',
    owner: user1._id,
    members: [
      { user: user1._id, role: 'owner' },
      { user: user2._id, role: 'admin' },
      { user: user3._id, role: 'member' },
    ],
    background: 'gradient-blue',
    isStarred: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const board2 = {
    _id: 'board_design',
    title: '🎨 Brand Redesign & Design System',
    description: 'Component library tokens, dark mode elevation, and motion guidelines.',
    owner: user2._id,
    members: [
      { user: user2._id, role: 'owner' },
      { user: user1._id, role: 'member' },
    ],
    background: 'gradient-purple',
    isStarred: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryStore.boards.push(board1, board2);

  const list1 = { _id: 'list_backlog', boardId: board1._id, title: '📋 Backlog', order: 0 };
  const list2 = { _id: 'list_inprogress', boardId: board1._id, title: '⚡ In Progress', order: 1 };
  const list3 = { _id: 'list_review', boardId: board1._id, title: '🔍 Code Review', order: 2 };
  const list4 = { _id: 'list_done', boardId: board1._id, title: '✅ Done & Deployed', order: 3 };

  memoryStore.lists.push(list1, list2, list3, list4);

  const cards = [
    {
      _id: 'card_1',
      boardId: board1._id,
      listId: list1._id,
      title: 'Architect WebSocket reconnection strategy with exponential backoff',
      description: 'Ensure Socket.io client reconnects cleanly after network loss and resyncs board state.',
      order: 0,
      priority: 'high',
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      labels: [
        { id: 'lbl_backend', text: 'Backend', color: '#3b82f6' },
        { id: 'lbl_realtime', text: 'Realtime', color: '#8b5cf6' },
      ],
      assignedTo: [user1._id, user3._id],
      checklist: [
        { id: 'chk_1', text: 'Configure heartbeat ping/pong interval', completed: true },
        { id: 'chk_2', text: 'Test offline buffer and state reconciliation', completed: false },
        { id: 'chk_3', text: 'Display reconnecting toast in UI', completed: false },
      ],
      comments: [
        { id: 'cm_1', user: user1._id, text: 'Checked Socket.io docs, client reconnection option is clean.', createdAt: new Date().toISOString() },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'card_2',
      boardId: board1._id,
      listId: list2._id,
      title: 'Implement drag-and-drop kanban columns and cards',
      description: 'Support fluid drag operations across lists with animated placeholder indicators.',
      order: 0,
      priority: 'urgent',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      labels: [
        { id: 'lbl_ui', text: 'Frontend UI', color: '#10b981' },
        { id: 'lbl_core', text: 'Core Feature', color: '#f59e0b' },
      ],
      assignedTo: [user1._id],
      checklist: [
        { id: 'chk_4', text: 'HTML5 drag events & ghost styling', completed: true },
        { id: 'chk_5', text: 'Real-time broadcast on card drop', completed: true },
        { id: 'chk_6', text: 'Smooth hover and reorder animations', completed: true },
      ],
      comments: [],
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'card_3',
      boardId: board1._id,
      listId: list2._id,
      title: 'Collaborator live presence indicators & active avatars',
      description: 'Show active users viewing the same board room with live pulsing status bubbles.',
      order: 1,
      priority: 'medium',
      dueDate: new Date(Date.now() + 86400000 * 4).toISOString(),
      labels: [
        { id: 'lbl_realtime', text: 'Realtime', color: '#8b5cf6' },
      ],
      assignedTo: [user2._id],
      checklist: [
        { id: 'chk_7', text: 'Join/leave board room tracking', completed: true },
        { id: 'chk_8', text: 'Avatar ring with color accents', completed: true },
      ],
      comments: [],
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'card_4',
      boardId: board1._id,
      listId: list3._id,
      title: 'JWT Auth token verification and route security middleware',
      description: 'Protect all board mutation endpoints and validate bearer tokens in WebSocket handshakes.',
      order: 0,
      priority: 'high',
      dueDate: new Date(Date.now() - 86400000).toISOString(), // overdue
      labels: [
        { id: 'lbl_security', text: 'Security', color: '#ef4444' },
      ],
      assignedTo: [user3._id],
      checklist: [
        { id: 'chk_9', text: 'Sign JWT with secret key and expiry', completed: true },
        { id: 'chk_10', text: 'Add Bearer auth header interceptor', completed: true },
      ],
      comments: [
        { id: 'cm_2', user: user3._id, text: 'Tokens expire in 7d; refresh flow can be added later.', createdAt: new Date().toISOString() },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'card_5',
      boardId: board1._id,
      listId: list4._id,
      title: 'Modern dark/light glassmorphic UI design system',
      description: 'Sleek frosted glass panels, vibrant tags, accessible contrast, and smooth micro-interactions.',
      order: 0,
      priority: 'low',
      dueDate: null,
      labels: [
        { id: 'lbl_ui', text: 'Frontend UI', color: '#10b981' },
      ],
      assignedTo: [user2._id],
      checklist: [],
      comments: [],
      createdAt: new Date().toISOString(),
    },
  ];

  memoryStore.cards.push(...cards);

  memoryStore.activities.push({
    _id: 'act_1',
    boardId: board1._id,
    user: user1._id,
    action: 'created board',
    details: '🚀 Q4 Product & Engineering Sprint',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  });
  memoryStore.activities.push({
    _id: 'act_2',
    boardId: board1._id,
    user: user2._id,
    action: 'moved card',
    details: '"Collaborator live presence indicators" to In Progress',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  });
};

// Seed immediately for memory mode
seedInitialMemoryStore();

// --- USER STORE ---
export const UserStore = {
  findByEmail: async (email) => {
    if (getDBStatus().isConnected) {
      return await UserModel.findOne({ email: email.toLowerCase() });
    }
    return memoryStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  findById: async (id) => {
    if (getDBStatus().isConnected) {
      return await UserModel.findById(id).select('-password');
    }
    const user = memoryStore.users.find((u) => u._id.toString() === id.toString());
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  },

  create: async ({ name, email, password, avatar, color }) => {
    if (getDBStatus().isConnected) {
      const newUser = new UserModel({ name, email, password, avatar, color });
      return await newUser.save();
    }
    const newUser = {
      _id: 'user_' + generateId(),
      name,
      email: email.toLowerCase(),
      password,
      avatar: avatar || '',
      color: color || '#6366f1',
      createdAt: new Date().toISOString(),
    };
    memoryStore.users.push(newUser);
    return newUser;
  },

  getAll: async () => {
    if (getDBStatus().isConnected) {
      return await UserModel.find().select('-password');
    }
    return memoryStore.users.map(({ password, ...u }) => u);
  },
};

// --- BOARD STORE ---
export const BoardStore = {
  getUserBoards: async (userId) => {
    if (getDBStatus().isConnected) {
      return await BoardModel.find({
        $or: [{ owner: userId }, { 'members.user': userId }],
      })
        .populate('owner', 'name email avatar color')
        .populate('members.user', 'name email avatar color')
        .sort({ updatedAt: -1 });
    }

    const boards = memoryStore.boards.filter(
      (b) =>
        b.owner.toString() === userId.toString() ||
        b.members.some((m) => m.user.toString() === userId.toString())
    );

    // populate
    return boards.map((b) => ({
      ...b,
      owner: memoryStore.users.find((u) => u._id === b.owner) || { name: 'Owner' },
      members: b.members.map((m) => ({
        ...m,
        user: memoryStore.users.find((u) => u._id === m.user) || { name: 'Member' },
      })),
    }));
  },

  getById: async (boardId) => {
    if (getDBStatus().isConnected) {
      return await BoardModel.findById(boardId)
        .populate('owner', 'name email avatar color')
        .populate('members.user', 'name email avatar color');
    }

    const board = memoryStore.boards.find((b) => b._id.toString() === boardId.toString());
    if (!board) return null;

    return {
      ...board,
      owner: memoryStore.users.find((u) => u._id === board.owner) || { name: 'Owner' },
      members: board.members.map((m) => ({
        ...m,
        user: memoryStore.users.find((u) => u._id === m.user) || { name: 'Member' },
      })),
    };
  },

  create: async ({ title, description, ownerId, background }) => {
    if (getDBStatus().isConnected) {
      const board = new BoardModel({
        title,
        description,
        owner: ownerId,
        members: [{ user: ownerId, role: 'owner' }],
        background: background || 'gradient-blue',
      });
      return await board.save();
    }

    const newBoard = {
      _id: 'board_' + generateId(),
      title,
      description: description || '',
      owner: ownerId,
      members: [{ user: ownerId, role: 'owner' }],
      background: background || 'gradient-blue',
      isStarred: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryStore.boards.unshift(newBoard);
    return newBoard;
  },

  update: async (boardId, updates) => {
    if (getDBStatus().isConnected) {
      return await BoardModel.findByIdAndUpdate(boardId, updates, { new: true });
    }

    const index = memoryStore.boards.findIndex((b) => b._id.toString() === boardId.toString());
    if (index === -1) return null;

    memoryStore.boards[index] = {
      ...memoryStore.boards[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return memoryStore.boards[index];
  },

  delete: async (boardId) => {
    if (getDBStatus().isConnected) {
      await BoardModel.findByIdAndDelete(boardId);
      await ListModel.deleteMany({ boardId });
      await CardModel.deleteMany({ boardId });
      await ActivityModel.deleteMany({ boardId });
      return true;
    }

    memoryStore.boards = memoryStore.boards.filter((b) => b._id.toString() !== boardId.toString());
    memoryStore.lists = memoryStore.lists.filter((l) => l.boardId.toString() !== boardId.toString());
    memoryStore.cards = memoryStore.cards.filter((c) => c.boardId.toString() !== boardId.toString());
    memoryStore.activities = memoryStore.activities.filter((a) => a.boardId.toString() !== boardId.toString());
    return true;
  },

  addMember: async (boardId, userId, role = 'member') => {
    if (getDBStatus().isConnected) {
      return await BoardModel.findByIdAndUpdate(
        boardId,
        { $push: { members: { user: userId, role } } },
        { new: true }
      );
    }

    const board = memoryStore.boards.find((b) => b._id.toString() === boardId.toString());
    if (!board) return null;
    if (!board.members.some((m) => m.user.toString() === userId.toString())) {
      board.members.push({ user: userId, role });
    }
    return board;
  },
};

// --- LIST STORE ---
export const ListStore = {
  getByBoardId: async (boardId) => {
    if (getDBStatus().isConnected) {
      return await ListModel.find({ boardId }).sort({ order: 1 });
    }
    return memoryStore.lists
      .filter((l) => l.boardId.toString() === boardId.toString())
      .sort((a, b) => a.order - b.order);
  },

  create: async ({ title, boardId, order }) => {
    if (getDBStatus().isConnected) {
      const list = new ListModel({ title, boardId, order });
      return await list.save();
    }

    const currentLists = memoryStore.lists.filter((l) => l.boardId.toString() === boardId.toString());
    const nextOrder = order !== undefined ? order : currentLists.length;

    const newList = {
      _id: 'list_' + generateId(),
      title,
      boardId,
      order: nextOrder,
      createdAt: new Date().toISOString(),
    };
    memoryStore.lists.push(newList);
    return newList;
  },

  update: async (listId, updates) => {
    if (getDBStatus().isConnected) {
      return await ListModel.findByIdAndUpdate(listId, updates, { new: true });
    }

    const index = memoryStore.lists.findIndex((l) => l._id.toString() === listId.toString());
    if (index === -1) return null;

    memoryStore.lists[index] = { ...memoryStore.lists[index], ...updates };
    return memoryStore.lists[index];
  },

  reorder: async (boardId, orderedListIds) => {
    if (getDBStatus().isConnected) {
      const ops = orderedListIds.map((id, index) =>
        ListModel.findByIdAndUpdate(id, { order: index })
      );
      await Promise.all(ops);
      return await ListModel.find({ boardId }).sort({ order: 1 });
    }

    orderedListIds.forEach((id, index) => {
      const list = memoryStore.lists.find((l) => l._id.toString() === id.toString());
      if (list) list.order = index;
    });

    return memoryStore.lists
      .filter((l) => l.boardId.toString() === boardId.toString())
      .sort((a, b) => a.order - b.order);
  },

  delete: async (listId) => {
    if (getDBStatus().isConnected) {
      await ListModel.findByIdAndDelete(listId);
      await CardModel.deleteMany({ listId });
      return true;
    }

    memoryStore.lists = memoryStore.lists.filter((l) => l._id.toString() !== listId.toString());
    memoryStore.cards = memoryStore.cards.filter((c) => c.listId.toString() !== listId.toString());
    return true;
  },
};

// --- CARD STORE ---
export const CardStore = {
  getByBoardId: async (boardId) => {
    if (getDBStatus().isConnected) {
      return await CardModel.find({ boardId })
        .populate('assignedTo', 'name email avatar color')
        .populate('comments.user', 'name email avatar color')
        .sort({ order: 1 });
    }

    const cards = memoryStore.cards.filter((c) => c.boardId.toString() === boardId.toString());
    return cards.map((c) => ({
      ...c,
      assignedTo: (c.assignedTo || []).map((uid) =>
        memoryStore.users.find((u) => u._id === uid) || { name: 'User', _id: uid }
      ),
      comments: (c.comments || []).map((cm) => ({
        ...cm,
        user: memoryStore.users.find((u) => u._id === cm.user) || { name: 'User', _id: cm.user },
      })),
    }));
  },

  getById: async (cardId) => {
    if (getDBStatus().isConnected) {
      return await CardModel.findById(cardId)
        .populate('assignedTo', 'name email avatar color')
        .populate('comments.user', 'name email avatar color');
    }

    const card = memoryStore.cards.find((c) => c._id.toString() === cardId.toString());
    if (!card) return null;

    return {
      ...card,
      assignedTo: (card.assignedTo || []).map((uid) =>
        memoryStore.users.find((u) => u._id === uid) || { name: 'User', _id: uid }
      ),
      comments: (card.comments || []).map((cm) => ({
        ...cm,
        user: memoryStore.users.find((u) => u._id === cm.user) || { name: 'User', _id: cm.user },
      })),
    };
  },

  create: async (data) => {
    if (getDBStatus().isConnected) {
      const card = new CardModel(data);
      await card.save();
      return await CardModel.findById(card._id).populate('assignedTo', 'name email avatar color');
    }

    const listCards = memoryStore.cards.filter((c) => c.listId.toString() === data.listId.toString());
    const nextOrder = data.order !== undefined ? data.order : listCards.length;

    const newCard = {
      _id: 'card_' + generateId(),
      ...data,
      order: nextOrder,
      priority: data.priority || 'medium',
      labels: data.labels || [],
      assignedTo: data.assignedTo || [],
      checklist: data.checklist || [],
      comments: data.comments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryStore.cards.push(newCard);

    return {
      ...newCard,
      assignedTo: (newCard.assignedTo || []).map((uid) =>
        memoryStore.users.find((u) => u._id === uid) || { name: 'User', _id: uid }
      ),
    };
  },

  update: async (cardId, updates) => {
    if (getDBStatus().isConnected) {
      return await CardModel.findByIdAndUpdate(cardId, updates, { new: true })
        .populate('assignedTo', 'name email avatar color')
        .populate('comments.user', 'name email avatar color');
    }

    const index = memoryStore.cards.findIndex((c) => c._id.toString() === cardId.toString());
    if (index === -1) return null;

    memoryStore.cards[index] = {
      ...memoryStore.cards[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const c = memoryStore.cards[index];
    return {
      ...c,
      assignedTo: (c.assignedTo || []).map((uid) =>
        typeof uid === 'object' ? uid : (memoryStore.users.find((u) => u._id === uid) || { name: 'User', _id: uid })
      ),
      comments: (c.comments || []).map((cm) => ({
        ...cm,
        user: typeof cm.user === 'object' ? cm.user : (memoryStore.users.find((u) => u._id === cm.user) || { name: 'User', _id: cm.user }),
      })),
    };
  },

  // Move card within list or between lists
  move: async ({ cardId, sourceListId, targetListId, newIndex }) => {
    if (getDBStatus().isConnected) {
      const card = await CardModel.findById(cardId);
      if (!card) return null;

      // Same list reorder or cross-list move
      if (sourceListId === targetListId) {
        const cards = await CardModel.find({ listId: targetListId }).sort({ order: 1 });
        const filtered = cards.filter((c) => c._id.toString() !== cardId.toString());
        filtered.splice(newIndex, 0, card);
        for (let i = 0; i < filtered.length; i++) {
          filtered[i].order = i;
          await filtered[i].save();
        }
      } else {
        // Source list adjust
        const sourceCards = await CardModel.find({ listId: sourceListId }).sort({ order: 1 });
        const remainingSource = sourceCards.filter((c) => c._id.toString() !== cardId.toString());
        for (let i = 0; i < remainingSource.length; i++) {
          remainingSource[i].order = i;
          await remainingSource[i].save();
        }

        // Target list insert
        const targetCards = await CardModel.find({ listId: targetListId }).sort({ order: 1 });
        card.listId = targetListId;
        targetCards.splice(newIndex, 0, card);
        for (let i = 0; i < targetCards.length; i++) {
          targetCards[i].order = i;
          await targetCards[i].save();
        }
      }

      return await CardModel.findById(cardId)
        .populate('assignedTo', 'name email avatar color')
        .populate('comments.user', 'name email avatar color');
    }

    // Memory store logic
    const card = memoryStore.cards.find((c) => c._id.toString() === cardId.toString());
    if (!card) return null;

    if (sourceListId === targetListId) {
      const listCards = memoryStore.cards
        .filter((c) => c.listId.toString() === targetListId.toString() && c._id.toString() !== cardId.toString())
        .sort((a, b) => a.order - b.order);
      
      listCards.splice(newIndex, 0, card);
      listCards.forEach((c, idx) => {
        c.order = idx;
      });
    } else {
      // Remove from source
      const sourceCards = memoryStore.cards
        .filter((c) => c.listId.toString() === sourceListId.toString() && c._id.toString() !== cardId.toString())
        .sort((a, b) => a.order - b.order);
      sourceCards.forEach((c, idx) => {
        c.order = idx;
      });

      // Insert into target
      card.listId = targetListId;
      const targetCards = memoryStore.cards
        .filter((c) => c.listId.toString() === targetListId.toString() && c._id.toString() !== cardId.toString())
        .sort((a, b) => a.order - b.order);
      targetCards.splice(newIndex, 0, card);
      targetCards.forEach((c, idx) => {
        c.order = idx;
      });
    }

    card.updatedAt = new Date().toISOString();
    return CardStore.getById(cardId);
  },

  delete: async (cardId) => {
    if (getDBStatus().isConnected) {
      await CardModel.findByIdAndDelete(cardId);
      return true;
    }

    memoryStore.cards = memoryStore.cards.filter((c) => c._id.toString() !== cardId.toString());
    return true;
  },
};

// --- ACTIVITY STORE ---
export const ActivityStore = {
  create: async ({ boardId, userId, action, details }) => {
    if (getDBStatus().isConnected) {
      const activity = new ActivityModel({ boardId, user: userId, action, details });
      await activity.save();
      return await ActivityModel.findById(activity._id).populate('user', 'name email avatar color');
    }

    const newActivity = {
      _id: 'act_' + generateId(),
      boardId,
      user: userId,
      action,
      details,
      createdAt: new Date().toISOString(),
    };
    memoryStore.activities.unshift(newActivity);

    return {
      ...newActivity,
      user: memoryStore.users.find((u) => u._id === userId) || { name: 'User' },
    };
  },

  getByBoardId: async (boardId, limit = 40) => {
    if (getDBStatus().isConnected) {
      return await ActivityModel.find({ boardId })
        .populate('user', 'name email avatar color')
        .sort({ createdAt: -1 })
        .limit(limit);
    }

    return memoryStore.activities
      .filter((a) => a.boardId.toString() === boardId.toString())
      .slice(0, limit)
      .map((a) => ({
        ...a,
        user: typeof a.user === 'object' ? a.user : (memoryStore.users.find((u) => u._id === a.user) || { name: 'User' }),
      }));
  },
};
