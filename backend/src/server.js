import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import createApp from './app.js';
import connectDB from './config/db.js';
import { configureCloudinary } from './config/cloudinary.js';
import registerRoomSocket from './sockets/roomSocket.js';

const PORT = process.env.PORT || 5000;

const bootstrap = async () => {
  // Connect services
  await connectDB();
  configureCloudinary();

  const app = createApp();
  const httpServer = createServer(app);

  // Socket.IO
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    maxHttpBufferSize: 1e8, // 100MB (for future direct socket uploads if needed)
  });

  io.on('connection', (socket) => {
    console.log(`[SOCKET] Connected: ${socket.id}`);
    registerRoomSocket(io, socket);
  });

  httpServer.listen(PORT, () => {
    console.log(`🚀 WatchTogether server running on port ${PORT}`);
  });
};

bootstrap().catch((err) => {
  console.error('Bootstrap error:', err);
  process.exit(1);
});
