import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [activeCollaborators, setActiveCollaborators] = useState([]);
  const [focusedCards, setFocusedCards] = useState({}); // cardId -> user
  const currentBoardIdRef = useRef(null);

  useEffect(() => {
    // Connect socket
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      setConnected(true);
      console.log('[Socket] Connected to server, ID:', socketInstance.id);
      
      // If user had an active board, re-join it
      if (currentBoardIdRef.current && user) {
        socketInstance.emit('join_board', {
          boardId: currentBoardIdRef.current,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            color: user.color,
          },
        });
      }
    });

    socketInstance.on('disconnect', () => {
      setConnected(false);
      console.log('[Socket] Disconnected from server');
    });

    socketInstance.on('active_collaborators', (collaborators) => {
      setActiveCollaborators(collaborators || []);
    });

    socketInstance.on('collaborator_focus_card', ({ cardId, user: focusedUser }) => {
      setFocusedCards((prev) => ({ ...prev, [cardId]: focusedUser }));
    });

    socketInstance.on('collaborator_blur_card', ({ cardId }) => {
      setFocusedCards((prev) => {
        const next = { ...prev };
        delete next[cardId];
        return next;
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const joinBoard = (boardId) => {
    if (!socket || !boardId || !user) return;
    currentBoardIdRef.current = boardId;
    socket.emit('join_board', {
      boardId,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        color: user.color,
      },
    });
  };

  const leaveBoard = (boardId) => {
    if (!socket || !boardId) return;
    socket.emit('leave_board', { boardId });
    if (currentBoardIdRef.current === boardId) {
      currentBoardIdRef.current = null;
    }
    setActiveCollaborators([]);
  };

  const notifyCardFocus = (boardId, cardId) => {
    if (!socket || !user || !boardId) return;
    socket.emit('user_active_card', {
      boardId,
      cardId,
      user: { _id: user._id, name: user.name, color: user.color },
    });
  };

  const notifyCardBlur = (boardId, cardId) => {
    if (!socket || !boardId) return;
    socket.emit('user_blur_card', { boardId, cardId });
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        activeCollaborators,
        focusedCards,
        joinBoard,
        leaveBoard,
        notifyCardFocus,
        notifyCardBlur,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
