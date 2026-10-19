const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const {
  validateTaskId,
  validateContentType,
  validateCreateTask,
  validateUpdateTask,
  validateQueryParams
} = require('../middleware/taskValidator');

// POST /api/tasks - Create task with payload validation
router.post(
  '/',
  validateContentType,
  validateCreateTask,
  taskController.createTask
);

// GET /api/tasks - Get all tasks (supports ?status=pending|in-progress|completed)
router.get(
  '/',
  validateQueryParams,
  taskController.getAllTasks
);

// GET /api/tasks/:id - Get single task by ID with parameter validation
router.get(
  '/:id',
  validateTaskId,
  taskController.getTaskById
);

// PUT /api/tasks/:id - Update task by ID with parameter & payload validation
router.put(
  '/:id',
  validateTaskId,
  validateContentType,
  validateUpdateTask,
  taskController.updateTask
);

// DELETE /api/tasks/:id - Delete task by ID with parameter validation
router.delete(
  '/:id',
  validateTaskId,
  taskController.deleteTask
);

module.exports = router;
