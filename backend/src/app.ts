import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config';
import authRoutes from './modules/auth/auth.routes';
import loansRoutes from './modules/loans/loans.routes';
import summaryRoutes from './modules/summary/summary.routes';
import { errorHandler } from './middleware/errorHandler';
import { NotFoundError } from './utils/errors';

export const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Serve static uploaded receipts
app.use('/uploads', express.static(config.uploadDir));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/loans', loansRoutes);
app.use('/api/summary', summaryRoutes);

// Catch-all for undefined routes
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
});

// Centralized Error Handler
app.use(errorHandler);
