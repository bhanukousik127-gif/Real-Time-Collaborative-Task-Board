# 🚀 SyncBoard — Real-Time Collaborative Task Board

A full-stack, Trello-style real-time task management application built with **React**, **Node.js**, **Express**, **MongoDB (Mongoose)**, **Socket.io**, and **JWT Authentication**.

---

## ✨ Features

- **⚡ Real-Time Multi-User Collaboration**:
  - Instant live card synchronization across collaborators using WebSockets (`Socket.io`).
  - Real-time drag-and-drop card movements and column changes with zero lag.
  - Live active collaborator presence indicator (online user count with animated pulse and avatar stack).
  - Live card editing indicator (`[User] is editing` glowing highlight).
  - Real-time slide-over Activity Log stream.
- **📋 Trello-Style Kanban Board**:
  - Drag-and-drop cards between and within columns.
  - Quick-add cards inline and customizable columns.
  - Interactive background themes (Ocean Indigo, Cyber Purple, Emerald Aurora, Sunset Glow, Midnight Slate).
  - Board filters (live search and priority filters: Urgent, High, Medium, Low).
- **📝 Rich Card Detail Dialog**:
  - Implements the latest modern web standards (`<dialog>`, `:modal`, light dismiss fallback, backdrop blur, `overscroll-behavior: contain`).
  - Checklist manager with progress bar and completion animations.
  - Due date picker with status badges and overdue detection.
  - Label manager with distinct tag colors.
  - Assignable team members.
  - Live comments feed.
- **🔐 Secure JWT Authentication**:
  - Email & password registration and login with `bcryptjs` password hashing.
  - Protected API routes and WebSocket room authentication.
  - One-click demo test accounts for instant multi-user testing.
- **🗄️ Robust Database Layer**:
  - Official Mongoose schemas for User, Board, List, Card, and Activity.
  - Seamless automatic fallback to an in-memory/JSON storage layer when running in zero-dependency local environments, ensuring immediate out-of-the-box execution while fully supporting production MongoDB Atlas / local MongoDB instances.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Vanilla Modern CSS, Lucide Icons |
| **Backend** | Node.js, Express 4, Socket.io 4, Morgan, CORS |
| **Database** | MongoDB & Mongoose (with zero-dependency fallback) |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), Password Hashing (`bcryptjs`) |
| **Real-time** | WebSockets via `socket.io` & `socket.io-client` |

---

## 📁 Project Structure

```text
collaborative-task-board/
├── package.json               # Root scripts (dev, install:all)
├── start-dev.js               # Concurrent runner for backend + frontend
├── README.md
├── server/
│   ├── .env                   # Server environment variables
│   ├── .env.example
│   ├── package.json
│   ├── server.js              # Express app & Socket.io server
│   ├── config/
│   │   └── db.js              # Database connection & fallback
│   ├── models/
│   │   ├── User.js            # User Mongoose model
│   │   ├── Board.js           # Board Mongoose model
│   │   ├── List.js            # List/Column Mongoose model
│   │   ├── Card.js            # Task Card Mongoose model
│   │   ├── Activity.js        # Activity Log Mongoose model
│   │   └── dbStore.js         # Unified data store layer
│   ├── middleware/
│   │   └── auth.js            # JWT verification middleware
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── boardController.js
│   │   ├── listController.js
│   │   ├── cardController.js
│   │   └── activityController.js
│   ├── routes/
│   └── sockets/
│       └── socketHandler.js   # Room presence & live broadcast
└── client/
    ├── .env                   # Frontend API and WebSocket URLs
    ├── .env.example
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── test-e2e.js            # Automated E2E verification test script
    └── src/
        ├── index.css          # Glassmorphic design system
        ├── main.jsx
        ├── App.jsx
        ├── context/
        │   ├── AuthContext.jsx
        │   └── SocketContext.jsx
        ├── services/
        │   └── api.js         # Fetch wrapper with JWT interceptor
        └── components/
            ├── Navbar.jsx
            ├── BoardHeader.jsx
            ├── BoardView.jsx
            ├── ListColumn.jsx
            ├── TaskCard.jsx
            ├── CardDetailModal.jsx
            ├── CreateBoardModal.jsx
            ├── ActivityDrawer.jsx
            └── AuthModal.jsx
```

---

## 🚀 Getting Started

### 1. Installation
Install all dependencies for both backend and frontend:
```bash
npm run install:all
```

### 2. Run Locally (Development)
Run both backend and frontend concurrently:
```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 👥 Built-In Demo Accounts

Use these accounts to test live multi-user real-time collaboration across separate browser windows or tabs:

| Name | Email | Password | Role |
|---|---|---|---|
| **Alex Morgan** | `alex@example.com` | `password123` | Lead Architect |
| **Sarah Chen** | `sarah@example.com` | `password123` | Product Designer |
| **David Kim** | `david@example.com` | `password123` | Full-Stack Engineer |

---

## 🧪 Automated Testing

Run the automated end-to-end multi-user WebSocket verification test:
```bash
cd client
node test-e2e.js
```
