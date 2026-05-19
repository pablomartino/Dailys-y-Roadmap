require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { initDB } = require('./db');

const membersRouter = require('./routes/members');
const tasksRouter = require('./routes/tasks');
const projectsRouter = require('./routes/projects');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: (process.env.CLIENT_URL || 'http://localhost:5173').trim(),
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/members', membersRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/projects', projectsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
async function start() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`✓ dailyboard server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
