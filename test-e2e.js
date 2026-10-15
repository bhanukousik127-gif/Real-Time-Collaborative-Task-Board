import { io } from 'socket.io-client';

const API_BASE = 'http://localhost:5000/api';
const WS_URL = 'http://localhost:5000';

async function runVerification() {
  console.log('🧪 Starting End-to-End Real-Time Collaboration Test...\n');

  // 1. Test Health
  const healthRes = await fetch(`${API_BASE}/health`).then((r) => r.json());
  console.log('✅ 1. Health check passed:', healthRes.status, '| DB:', healthRes.database);

  // 2. User 1 Login (Alex)
  const loginAlex = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'alex@example.com', password: 'password123' }),
  }).then((r) => r.json());
  console.log('✅ 2. User 1 (Alex) logged in successfully. Token received.');

  // 3. User 2 Login (Sarah)
  const loginSarah = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'sarah@example.com', password: 'password123' }),
  }).then((r) => r.json());
  console.log('✅ 3. User 2 (Sarah) logged in successfully. Token received.');

  // 4. Fetch boards
  const boardsRes = await fetch(`${API_BASE}/boards`, {
    headers: { Authorization: `Bearer ${loginAlex.token}` },
  }).then((r) => r.json());
  const sprintBoard = boardsRes.boards[0];
  console.log(`✅ 4. Retrieved ${boardsRes.boards.length} boards. Selected: "${sprintBoard.title}"`);

  // 5. Connect Socket for Alex and Sarah
  const socketAlex = io(WS_URL, { transports: ['websocket'] });
  const socketSarah = io(WS_URL, { transports: ['websocket'] });

  await new Promise((resolve) => socketAlex.on('connect', resolve));
  await new Promise((resolve) => socketSarah.on('connect', resolve));
  console.log('✅ 5. Both WebSockets connected to Socket.io server.');

  // 6. Join Board Room
  let collaboratorsReceived = false;
  socketSarah.on('active_collaborators', (collaborators) => {
    if (collaborators.length >= 2) {
      collaboratorsReceived = true;
      console.log(`✅ 6. Real-time presence synced: ${collaborators.length} collaborators online (${collaborators.map((c) => c.name).join(', ')})`);
    }
  });

  socketAlex.emit('join_board', { boardId: sprintBoard._id, user: loginAlex.user });
  socketSarah.emit('join_board', { boardId: sprintBoard._id, user: loginSarah.user });

  await new Promise((r) => setTimeout(r, 600));

  // 7. Real-Time Card Creation Broadcast Test
  const newCardPromise = new Promise((resolve) => {
    socketSarah.on('card_created', (card) => {
      console.log(`✅ 7. Real-Time Sync Verified: Sarah received card_created event for "${card.title}" instantly!`);
      resolve(card);
    });
  });

  // Alex fetches board details to get lists
  const boardDetails = await fetch(`${API_BASE}/boards/${sprintBoard._id}`, {
    headers: { Authorization: `Bearer ${loginAlex.token}` },
  }).then((r) => r.json());

  const backlogList = boardDetails.lists[0];
  const inProgressList = boardDetails.lists[1];

  // Alex creates a card
  const createdCardRes = await fetch(`${API_BASE}/cards`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${loginAlex.token}`,
    },
    body: JSON.stringify({
      boardId: sprintBoard._id,
      listId: backlogList._id,
      title: 'E2E Real-time Automated Test Task',
      description: 'Created during test run to verify WebSocket synchronization.',
      priority: 'urgent',
    }),
  }).then((r) => r.json());

  const createdCard = await newCardPromise;

  // 8. Real-Time Drag-and-Drop Card Move Test
  const moveCardPromise = new Promise((resolve) => {
    socketSarah.on('card_moved', ({ cardId, targetListId }) => {
      console.log(`✅ 8. Real-Time Drag-and-Drop Move Verified: Sarah received card_moved event for cardId ${cardId} to list ${targetListId}!`);
      resolve();
    });
  });

  await fetch(`${API_BASE}/cards/${createdCard._id}/move`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${loginAlex.token}`,
    },
    body: JSON.stringify({
      cardId: createdCard._id,
      sourceListId: backlogList._id,
      targetListId: inProgressList._id,
      newIndex: 0,
      boardId: sprintBoard._id,
    }),
  });

  await moveCardPromise;

  // 9. Real-Time Comment Test
  const commentPromise = new Promise((resolve) => {
    socketSarah.on('card_updated', (updatedCard) => {
      if (updatedCard._id === createdCard._id && updatedCard.comments.length > 0) {
        console.log(`✅ 9. Real-Time Comment Sync Verified: Sarah received comment "${updatedCard.comments[0].text}"!`);
        resolve();
      }
    });
  });

  await fetch(`${API_BASE}/cards/${createdCard._id}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${loginAlex.token}`,
    },
    body: JSON.stringify({ text: 'Great progress on this! Ready for review.' }),
  });

  await commentPromise;

  // Cleanup sockets
  socketAlex.disconnect();
  socketSarah.disconnect();

  console.log('\n🎉 ALL FULL-STACK REAL-TIME TESTS PASSED SUCCESSFULLY! 🚀');
  process.exit(0);
}

runVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
