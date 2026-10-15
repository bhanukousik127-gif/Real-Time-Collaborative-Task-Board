// Map of boardId -> Map(socketId -> userInfo)
const boardPresences = new Map();

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    let currentBoardId = null;
    let currentUser = null;

    // Join a board room
    socket.on('join_board', ({ boardId, user }) => {
      if (!boardId || !user) return;

      currentBoardId = boardId;
      currentUser = user;

      socket.join(boardId);

      if (!boardPresences.has(boardId)) {
        boardPresences.set(boardId, new Map());
      }

      const boardMap = boardPresences.get(boardId);
      boardMap.set(socket.id, user);

      // Broadcast distinct active collaborators on this board
      const activeUsers = Array.from(boardMap.values());
      // Deduplicate by user ID
      const uniqueUsers = Array.from(
        new Map(activeUsers.map((u) => [u._id, u])).values()
      );

      io.to(boardId).emit('active_collaborators', uniqueUsers);
      console.log(`[Socket] ${user.name} joined board ${boardId}. Active users: ${uniqueUsers.length}`);
    });

    // Leave a board room
    socket.on('leave_board', ({ boardId }) => {
      if (!boardId) return;

      socket.leave(boardId);

      if (boardPresences.has(boardId)) {
        const boardMap = boardPresences.get(boardId);
        boardMap.delete(socket.id);

        if (boardMap.size === 0) {
          boardPresences.delete(boardId);
        } else {
          const uniqueUsers = Array.from(
            new Map(Array.from(boardMap.values()).map((u) => [u._id, u])).values()
          );
          io.to(boardId).emit('active_collaborators', uniqueUsers);
        }
      }

      currentBoardId = null;
    });

    // Collaborator focus / typing indicator
    socket.on('user_active_card', ({ boardId, cardId, user }) => {
      socket.to(boardId).emit('collaborator_focus_card', { cardId, user });
    });

    socket.on('user_blur_card', ({ boardId, cardId, user }) => {
      socket.to(boardId).emit('collaborator_blur_card', { cardId, user });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      if (currentBoardId && boardPresences.has(currentBoardId)) {
        const boardMap = boardPresences.get(currentBoardId);
        boardMap.delete(socket.id);

        if (boardMap.size === 0) {
          boardPresences.delete(currentBoardId);
        } else {
          const uniqueUsers = Array.from(
            new Map(Array.from(boardMap.values()).map((u) => [u._id, u])).values()
          );
          io.to(currentBoardId).emit('active_collaborators', uniqueUsers);
        }
      }
      console.log(`[Socket] Socket disconnected: ${socket.id}`);
    });
  });
};
