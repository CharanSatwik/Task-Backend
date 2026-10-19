const express = require('express');
const path = require('path');
const taskRoutes = require('./routes/taskRoutes');
const {
  jsonParseErrorHandler,
  notFoundHandler,
  globalErrorHandler
} = require('./middleware/errorHandler');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Handle malformed JSON body errors
app.use(jsonParseErrorHandler);

// Serve static interactive dashboard from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Mount task management REST API routes under /api/tasks
app.use('/api/tasks', taskRoutes);

// Fallback 404 handler for unknown routes
app.use(notFoundHandler);

// Centralized 500 error handler
app.use(globalErrorHandler);

module.exports = app;
