
# 🎬 WatchTogether

> Real-time synchronized video watching platform. Upload a video, create a room, share the link, and watch together — perfectly in sync.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + Tailwind CSS |
| State | Zustand |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Real-time | Socket.IO |
| Video | Cloudinary |
| Upload | Multer |

---

## Quick Start

### 1. Clone & Install

```bash
git clone <repo-url>
cd watchtogether

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Environment Variables

**`backend/.env`**
```env
PORT=5000
MONGO_URI=mongodb+srv://...
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Run

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

Open **http://localhost:5173**

---

## Features

| | Feature | Description |
|---|---------|-------------|
| 🏠 | **Room Management** | Create or join rooms with unique 8-char IDs |
| 👤 | **Lobby Screen** | Set your nickname before joining |
| 📤 | **Video Upload** | Host uploads video — auto-synced to Cloudinary |
| ▶️ | **Playback Sync** | Real-time play, pause, and seek across all clients |
| ⏱️ | **Drift Correction** | Auto-seek if any viewer falls >2s behind |
| 💬 | **Live Chat** | Room-scoped chat with user avatars |
| 👥 | **User List** | Connected users panel with host badge |
| 👑 | **Host Controls** | Only the host can play, pause, or seek |
| 🔄 | **Host Transfer** | Auto-reassigns host when they leave |
| 📋 | **Share Link** | One-click copy of the room invite URL |
| 📱 | **Responsive** | Fully optimised for mobile and desktop |

---

## Socket Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `join-room` | Client → Server | `{ roomId, nickname }` |
| `room-state` | Server → Client | Full room state |
| `user-joined` | Server → Room | `{ socketId, nickname, users }` |
| `user-left` | Server → Room | `{ socketId, nickname, users }` |
| `host-changed` | Server → Room | `{ newHostSocketId, nickname }` |
| `video-uploaded` | Host → Server | `{ roomId, videoUrl, videoTitle }` |
| `video-ready` | Server → Room | `{ videoUrl, videoTitle }` |
| `play-video` | Host → Server | `{ roomId, currentTime }` |
| `pause-video` | Host → Server | `{ roomId, currentTime }` |
| `seek-video` | Host → Server | `{ roomId, currentTime }` |
| `sync-time` | Host → Server | `{ roomId, currentTime, isPlaying }` |
| `send-message` | Client → Server | `{ roomId, text }` |
| `receive-message` | Server → Room | `{ userId, nickname, text, timestamp }` |
| `leave-room` | Client → Server | `{ roomId }` |

---

## REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/rooms/create` | Create a new room |
| `GET` | `/api/rooms/:roomId` | Get room details |
| `POST` | `/api/rooms/:roomId/upload` | Upload video (multipart) |
| `DELETE` | `/api/rooms/:roomId` | Close a room |

---

## Deployment

### ⚙️ Backend → Render

1. Create a new Web Service
2. Connect your repo, set root to `backend/`
3. Build command: `npm install` — Start command: `npm start`
4. Add environment variables in the Render dashboard

### ▲ Frontend → Vercel

1. Import repo, set root to `frontend/`
2. Build: `npm run build` — Output: `dist`
3. Set `VITE_API_URL` and `VITE_SOCKET_URL` to your Render URL

### 🍃 MongoDB → Atlas

1. Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Whitelist `0.0.0.0/0` for IP access
3. Copy connection string to `MONGO_URI`

### ☁️ Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Copy your Cloud Name, API Key, and API Secret
3. Paste into backend environment variables
4. 
