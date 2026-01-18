import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';

import authRoutes from './routes/auth.js';
import driverRoutes from './routes/drivers.js';
import dashboardRoutes from './routes/dashboard.js';
import userRoutes from './routes/users.js';
import jobRoutes from './routes/jobs.js';
import disputeRoutes from './routes/disputes.js';
import financeRoutes from './routes/finance.js';
import campaignRoutes from './routes/campaigns.js';
import notificationRoutes from './routes/notifications.js';
import systemRoutes from './routes/system.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:5173'], // Admin client URLs
  credentials: true
}));

app.use(express.json({ limit: '10mb' })); // For document uploads
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'admin-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: parseInt(process.env.ADMIN_SESSION_TIMEOUT || '3600000') // 1 hour
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/system', systemRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'towapp-admin-server' });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Admin server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🔧 TOWAPP Admin Server running on port ${PORT}`);
  console.log(`📊 Admin Dashboard: http://localhost:3001`);
  console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;