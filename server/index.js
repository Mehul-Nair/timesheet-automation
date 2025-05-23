import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import timesheetRoutes from './routes/timesheetRoutes.js';
import cronJobRoutes from './routes/cronJobRoutes.js';
import dotenv from 'dotenv';

dotenv.config();

// Get the directory name in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Create files if they don't exist
const timesheetsFile = path.join(dataDir, 'timesheets.json');
const cronJobsFile = path.join(dataDir, 'cronjobs.json');

if (!fs.existsSync(timesheetsFile)) {
  fs.writeFileSync(timesheetsFile, JSON.stringify([]));
}

if (!fs.existsSync(cronJobsFile)) {
  fs.writeFileSync(cronJobsFile, JSON.stringify([]));
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Allow requests from your frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/timesheets', timesheetRoutes);
app.use('/api/cron-jobs', cronJobRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;