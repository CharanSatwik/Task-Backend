const Task = require('./taskSchema');
const { ALLOWED_STATUSES, TASK_STATUSES } = require('../config/constants');

/**
 * In-Memory Task Repository
 * Manages the task storage array and CRUD operations.
 */
class TaskModel {
  constructor() {
    this.ALLOWED_STATUSES = ALLOWED_STATUSES;
    this.tasks = [];
    this.nextId = 1;
    this.seedDefaults();
  }

  /**
   * Seed initial sample tasks so the API has immediate data when started
   */
  seedDefaults() {
    this.tasks = [
      new Task({
        id: this.nextId++,
        title: 'Learn Node.js and Express',
        description: 'Understand routing, middleware, and controllers',
        status: TASK_STATUSES.COMPLETED,
        created_at: new Date(Date.now() - 3600000).toISOString()
      }),
      new Task({
        id: this.nextId++,
        title: 'Build Task Management API',
        description: 'Implement full CRUD routes under /api/tasks with validation',
        status: TASK_STATUSES.IN_PROGRESS,
        created_at: new Date(Date.now() - 1800000).toISOString()
      }),
      new Task({
        id: this.nextId++,
        title: 'Test endpoints in browser and Postman',
        description: 'Verify GET, POST, PUT, and DELETE operations',
        status: TASK_STATUSES.PENDING,
        created_at: new Date().toISOString()
      })
    ];
  }

  /**
   * Retrieve all tasks with optional status and search filtering
   * @param {Object} [filter]
   * @param {string} [filter.status]
   * @param {string} [filter.search]
   * @returns {Task[]}
   */
  findAll(filter = {}) {
    let result = [...this.tasks];

    if (filter.status) {
      result = result.filter(task => task.status === filter.status);
    }

    if (filter.search) {
      const query = filter.search.toLowerCase();
      result = result.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
      );
    }

    return result.map(task => task.toJSON());
  }

  /**
   * Find a single task by ID
   * @param {number|string} id
   * @returns {Object|null}
   */
  findById(id) {
    const task = this.tasks.find(item => String(item.id) === String(id));
    return task ? task.toJSON() : null;
  }

  /**
   * Create and store a new task
   * @param {Object} taskData
   * @param {string} taskData.title
   * @param {string} [taskData.description]
   * @param {string} [taskData.status]
   * @returns {Object}
   */
  create({ title, description = '', status = TASK_STATUSES.PENDING }) {
    const newTask = new Task({
      id: this.nextId++,
      title,
      description,
      status: status || TASK_STATUSES.PENDING
    });

    this.tasks.push(newTask);
    return newTask.toJSON();
  }

  /**
   * Update an existing task by ID
   * @param {number|string} id
   * @param {Object} updates
   * @returns {Object|null}
   */
  update(id, updates) {
    const taskIndex = this.tasks.findIndex(item => String(item.id) === String(id));
    if (taskIndex === -1) {
      return null;
    }

    const currentTask = this.tasks[taskIndex];
    const updatedTask = new Task({
      id: currentTask.id,
      title: updates.title !== undefined ? updates.title : currentTask.title,
      description: updates.description !== undefined ? updates.description : currentTask.description,
      status: updates.status !== undefined ? updates.status : currentTask.status,
      created_at: currentTask.created_at
    });

    this.tasks[taskIndex] = updatedTask;
    return updatedTask.toJSON();
  }

  /**
   * Delete a task by ID
   * @param {number|string} id
   * @returns {Object|null}
   */
  delete(id) {
    const taskIndex = this.tasks.findIndex(item => String(item.id) === String(id));
    if (taskIndex === -1) {
      return null;
    }

    const [deletedTask] = this.tasks.splice(taskIndex, 1);
    return deletedTask.toJSON();
  }

  /**
   * Reset store state (primarily for automated testing)
   * @param {boolean} [seed=false]
   */
  reset(seed = false) {
    this.tasks = [];
    this.nextId = 1;
    if (seed) {
      this.seedDefaults();
    }
  }
}

// Export singleton instance
module.exports = new TaskModel();
