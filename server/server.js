require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const planRoutes = require('./routes/planRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Global Middlewares
app.use(cors());
app.use(express.json());

// Serverless DB Connection Middleware: Ensures MongoDB connection is ready on serverless cold starts
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection error in middleware:', err.message);
    next();
  }
});

// Health check handler
const healthHandler = (req, res) => {
  res.status(200).json({
    status: 'online',
    appName: 'PackMaster Pro Backend',
    timestamp: new Date().toISOString(),
  });
};
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// API Routes (mounted with /api and without /api to support direct serverless rewrites)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/plans', planRoutes);
app.use('/plans', planRoutes);

app.use('/api/ai', aiRoutes);
app.use('/ai', aiRoutes);

// Root welcome route
const welcomeHandler = (req, res) => {
  res.send('PackMaster Pro API is active. Access endpoints under /api');
};
app.get('/', welcomeHandler);
app.get('/api', welcomeHandler);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message,
  });
});

// Start Express Server only when executed directly (not when required as a serverless function)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 PackMaster Pro Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
