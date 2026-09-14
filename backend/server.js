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
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));
app.options('*', cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/notifications', notificationRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: '🚀 RetainCurve Spaced Repetition API is running successfully!',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      learning: '/api/learning',
      todos: '/api/todos',
      notifications: '/api/notifications',
    },
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Forgetting Curve Revision API is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Database connection helper with automatic fallback to Atlas cluster or in-memory MongoDB
const connectDB = async () => {
  const defaultAtlasUri = 'mongodb+srv://nitrongym_db_user:46Fh7lQMuG7aZqS1@cluster0.cbeoafy.mongodb.net/nitrofitnessgym?retryWrites=true&w=majority&appName=Cluster0';
  const mongoUri = process.env.MONGODB_URI || defaultAtlasUri;

  if (mongoUri) {
    try {
      console.log(`[Database] Connecting to MongoDB at ${mongoUri.replace(/:([^:@]+)@/, ':****@')}...`);
      await mongoose.connect(mongoUri);
      console.log('[Database] Connected to external MongoDB successfully!');
      return;
    } catch (err) {
      console.warn('[Database] Failed connecting to MongoDB, falling back to embedded MongoDB:', err.message);
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
