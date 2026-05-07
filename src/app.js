import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Ensure env variables are loaded
dotenv.config();

import authRoutes from './routes/auth.routes.js';
import chatRoutes from './routes/chat.routes.js';
import usersRoutes from './routes/users.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import storyRoutes from "./routes/story.routes.js";
import snapRoutes from './routes/snap.routes.js';
import "./utils/storyArchiveCron.js";
import aiRoutes from './routes/ai.routes.js'
import locationRoutes from "./routes/location.routes.js";

const app = express();

// Allowed origins for CORS
const allowedOrigins = [
  "http://localhost:5173",  // Development
  "http://localhost:3000",  // Local testing
  process.env.CLIENT_URL    // Production
].filter(Boolean);

// Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'SnapClone Backend is healthy' });
});

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use("/api/v1/stories", storyRoutes);
app.use('/api/v1/snaps', snapRoutes)
app.use('/api/v1/ai', aiRoutes);
app.use("/api/v1/location", locationRoutes);

export default app;