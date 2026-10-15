import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { BoardHeader } from './components/BoardHeader';
import { BoardView } from './components/BoardView';
import { CreateBoardModal } from './components/CreateBoardModal';
import { ActivityDrawer } from './components/ActivityDrawer';
import { AuthModal } from './components/AuthModal';
import { api } from './services/api';
import { useSocket } from './context/SocketContext';
import { Loader2 } from 'lucide-react';

export function App() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { socket } = useSocket();

  const [boards, setBoards] = useState([]);
  const [currentBoard, setCurrentBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [cards, setCards] = useState([]);
  const [activities, setActivities] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const [loadingBoard, setLoadingBoard] = useState(false);
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Load initial boards and users when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadInitialData = async () => {
      try {
        const [boardsRes, usersRes] = await Promise.all([
          api.getBoards(),
          api.getUsers(),
        ]);

        setBoards(boardsRes.boards || []);
        setAllUsers(usersRes.users || []);

        // Select the first board or starred board
        if (boardsRes.boards && boardsRes.boards.length > 0) {
          const defaultBoard =
            boardsRes.boards.find((b) => b.isStarred) || boardsRes.boards[0];
          loadBoardDetails(defaultBoard._id);
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    };

    loadInitialData();
  }, [isAuthenticated]);

  // Load detailed board content (lists, cards, activities)
  const loadBoardDetails = async (boardId) => {
    setLoadingBoard(true);
    try {
      const res = await api.getBoard(boardId);
      setCurrentBoard(res.board);
      setLists(res.lists || []);
      setCards(res.cards || []);
      setActivities(res.activities || []);
    } catch (err) {
      console.error('Failed to load board details:', err);
    } finally {
      setLoadingBoard(false);
    }
  };

  // Real-time listener for board mutations
  useEffect(() => {
    if (!socket) return;

    const handleBoardUpdated = (updatedBoard) => {
      setBoards((prev) =>
        prev.map((b) => (b._id === updatedBoard._id ? updatedBoard : b))
      );
      if (currentBoard && currentBoard._id === updatedBoard._id) {
        setCurrentBoard(updatedBoard);
      }
    };

    const handleBoardDeleted = ({ boardId }) => {
      setBoards((prev) => prev.filter((b) => b._id !== boardId));
      if (currentBoard && currentBoard._id === boardId) {
        const remaining = boards.filter((b) => b._id !== boardId);
        if (remaining.length > 0) {
          loadBoardDetails(remaining[0]._id);
        } else {
          setCurrentBoard(null);
          setLists([]);
          setCards([]);
        }
      }
    };

    socket.on('board_updated', handleBoardUpdated);
    socket.on('board_deleted', handleBoardDeleted);

    return () => {
      socket.off('board_updated', handleBoardUpdated);
      socket.off('board_deleted', handleBoardDeleted);
    };
  }, [socket, currentBoard?._id, boards]);

  // Board CRUD Handlers
  const handleCreateBoard = async ({ title, description, background }) => {
    try {
      const res = await api.createBoard({ title, description, background });
      setBoards((prev) => [res.board, ...prev]);
      loadBoardDetails(res.board._id);
    } catch (err) {
      console.error('Failed to create board:', err);
    }
  };

  const handleUpdateBoard = async (updates) => {
    if (!currentBoard) return;
    try {
      setCurrentBoard((prev) => ({ ...prev, ...updates }));
      setBoards((prev) =>
        prev.map((b) => (b._id === currentBoard._id ? { ...b, ...updates } : b))
      );
      await api.updateBoard(currentBoard._id, updates);
    } catch (err) {
      console.error('Failed to update board:', err);
    }
  };

  const handleDeleteBoard = async (boardId) => {
    try {
      await api.deleteBoard(boardId);
      const remaining = boards.filter((b) => b._id !== boardId);
      setBoards(remaining);
      if (remaining.length > 0) {
        loadBoardDetails(remaining[0]._id);
      } else {
        setCurrentBoard(null);
        setLists([]);
        setCards([]);
      }
    } catch (err) {
      console.error('Failed to delete board:', err);
    }
  };

  const handleInviteMember = async (userId) => {
    if (!currentBoard) return;
    try {
      const res = await api.addBoardMember(currentBoard._id, userId);
      setCurrentBoard(res.board);
    } catch (err) {
      console.error('Failed to invite member:', err);
    }
  };

  const handleActivityLogged = (newActivity) => {
    setActivities((prev) => [newActivity, ...prev]);
  };

  // If loading auth state
  if (authLoading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-app)',
          color: 'var(--text-secondary)',
          gap: 12,
        }}
      >
        <Loader2 size={24} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
        <span>Initializing SyncBoard workspace...</span>
      </div>
    );
  }

  // If not logged in, show AuthModal
  if (!isAuthenticated) {
    return <AuthModal />;
  }

  const currentTheme = currentBoard ? currentBoard.background || 'gradient-blue' : 'gradient-blue';

  return (
    <div className={`app-container ${currentTheme}`}>
      {/* Top Navigation */}
      <Navbar
        boards={boards}
        currentBoard={currentBoard}
        onSelectBoard={(id) => loadBoardDetails(id)}
        onOpenCreateBoard={() => setIsCreateBoardOpen(true)}
        onToggleActivity={() => setIsActivityOpen(!isActivityOpen)}
        activityCount={activities.length}
      />

      {/* Board Header Bar */}
      {currentBoard && (
        <BoardHeader
          board={currentBoard}
          onUpdateBoard={handleUpdateBoard}
          onDeleteBoard={handleDeleteBoard}
          onInviteMember={handleInviteMember}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          allUsers={allUsers}
        />
      )}

      {/* Main Board Canvas */}
      {loadingBoard ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            gap: 10,
          }}
        >
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
          <span>Synchronizing board state...</span>
        </div>
      ) : currentBoard ? (
        <BoardView
          board={currentBoard}
          lists={lists}
          cards={cards}
          setLists={setLists}
          setCards={setCards}
          searchQuery={searchQuery}
          priorityFilter={priorityFilter}
          allUsers={allUsers}
          onActivityLogged={handleActivityLogged}
        />
      ) : (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            color: 'var(--text-secondary)',
          }}
        >
          <h3>No board selected</h3>
          <button
            className="btn btn-primary"
            onClick={() => setIsCreateBoardOpen(true)}
          >
            Create Your First Board
          </button>
        </div>
      )}

      {/* Create Board Modal */}
      <CreateBoardModal
        isOpen={isCreateBoardOpen}
        onClose={() => setIsCreateBoardOpen(false)}
        onCreateBoard={handleCreateBoard}
      />

      {/* Activity Log Drawer */}
      <ActivityDrawer
        isOpen={isActivityOpen}
        onClose={() => setIsActivityOpen(false)}
        activities={activities}
      />
    </div>
  );
}

export default App;
