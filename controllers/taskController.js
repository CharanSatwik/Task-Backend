const taskModel = require('../models/taskModel');

/**
 * Task Controller
 * Handles incoming HTTP requests and structures HTTP responses.
 */
const taskController = {
  /**
   * POST /api/tasks
   * Create a new task (201 Created)
   */
  createTask(req, res) {
    const { title, description, status } = req.body;

    const newTask = taskModel.create({
      title,
      description,
      status
    });

    return res.status(201).json(newTask);
  },

  /**
   * GET /api/tasks
   * Retrieve all tasks with optional status and search filtering (200 OK)
   */
  getAllTasks(req, res) {
    const { status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.search = search;

    const tasks = taskModel.findAll(filter);
    return res.status(200).json(tasks);
  },

  /**
   * GET /api/tasks/:id
   * Retrieve a single task by ID (200 OK / 404 Not Found)
   */
  getTaskById(req, res) {
    const { id } = req.params;
    const task = taskModel.findById(id);

    if (!task) {
      return res.status(404).json({
        error: `Task with id '${id}' not found.`
      });
    }

    return res.status(200).json(task);
  },

  /**
   * PUT /api/tasks/:id
   * Update an existing task by ID (200 OK / 404 Not Found)
   */
  updateTask(req, res) {
    const { id } = req.params;
    const existingTask = taskModel.findById(id);

    if (!existingTask) {
      return res.status(404).json({
        error: `Task with id '${id}' not found.`
      });
    }

    const { title, description, status } = req.body;
    const updatedTask = taskModel.update(id, {
      title,
      description,
      status
    });

    return res.status(200).json(updatedTask);
  },

  /**
   * DELETE /api/tasks/:id
   * Delete an existing task by ID (200 OK / 404 Not Found)
   */
  deleteTask(req, res) {
    const { id } = req.params;
    const deletedTask = taskModel.delete(id);

    if (!deletedTask) {
      return res.status(404).json({
        error: `Task with id '${id}' not found.`
      });
    }

    return res.status(200).json({
      message: `Task with id '${id}' deleted successfully.`,
      task: deletedTask
    });
  }
};

module.exports = taskController;
