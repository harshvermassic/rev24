const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const learningRoutes = require('./routes/learningRoutes');
const todoRoutes = require('./routes/todoRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { initScheduler } = require('./services/notificationScheduler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Forgetting Curve Revision API is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Database connection helper with automatic fallback to in-memory MongoDB
const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (mongoUri) {
    try {
      console.log(`[Database] Connecting to MongoDB at ${mongoUri}...`);
      await mongoose.connect(mongoUri);
      console.log('[Database] Connected to external MongoDB successfully!');
      return;
    } catch (err) {
      console.warn('[Database] Failed connecting to MONGODB_URI, falling back to embedded MongoDB:', err.message);
    }
  }

  try {
    console.log('[Database] Initializing embedded MongoDB Memory Server for immediate out-of-the-box local use...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log(`[Database] Connected to embedded MongoDB successfully at: ${uri}`);
  } catch (memErr) {
    console.error('[Database] Critical: Could not connect to MongoDB:', memErr.message);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  await connectDB();

  // Initialize node-cron background scheduler
  initScheduler();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`🚀 Forgetting Curve Backend running on http://localhost:${PORT}`);
    console.log(`====================================================`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = { app, connectDB };
