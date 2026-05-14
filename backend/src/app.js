import express from 'express';
import cors from 'cors';
import roomRoutes from './routes/roomRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const createApp = () => {
  const app = express();

  // CORS
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

  // API routes
  app.use('/api/rooms', roomRoutes);

  // Global error handler
  app.use(errorHandler);

  return app;
};

export default createApp;
