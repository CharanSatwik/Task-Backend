const { ALLOWED_STATUSES, VALIDATION_LIMITS } = require('../config/constants');
const Task = require('../models/taskSchema');

/**
 * Validate that the route :id parameter is a positive integer.
 */
const validateTaskId = (req, res, next) => {
  const { id } = req.params;

  if (!id || !/^\d+$/.test(id) || parseInt(id, 10) <= 0) {
    return res.status(400).json({
      error: `Invalid task ID '${id}'. ID must be a positive integer.`
    });
  }

  next();
};

/**
 * Validate Content-Type header on requests that carry a payload.
 */
const validateContentType = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (contentType && !contentType.toLowerCase().includes('application/json')) {
      return res.status(415).json({
        error: 'Unsupported Media Type. Content-Type must be application/json.'
      });
    }
  }
  next();
};

/**
 * Validate request body for creating a task (POST /api/tasks).
 */
const validateCreateTask = (req, res, next) => {
  const body = req.body;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({
      error: 'Request body must be a valid JSON object.'
    });
  }

  const { title, description, status, id, created_at } = body;

  // Prevent client from setting auto-generated fields
  if (id !== undefined || created_at !== undefined) {
    return res.status(400).json({
      error: "Fields 'id' and 'created_at' are auto-generated and cannot be provided manually."
    });
  }

  // Schema-level validation
  const validation = Task.validate({ title, description, status }, false);
  if (!validation.isValid) {
    return res.status(400).json({
      error: validation.errors[0],
      details: validation.errors
    });
  }

  next();
};

/**
 * Validate request body for updating a task (PUT /api/tasks/:id).
 */
const validateUpdateTask = (req, res, next) => {
  const body = req.body;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({
      error: 'Request body must be a valid JSON object.'
    });
  }

  const { title, description, status, id, created_at } = body;

  // Disallow modifying immutable fields
  if (id !== undefined || created_at !== undefined) {
    return res.status(400).json({
      error: "Fields 'id' and 'created_at' are immutable and cannot be updated."
    });
  }

  // Ensure at least one updatable field is provided
  if (title === undefined && description === undefined && status === undefined) {
    return res.status(400).json({
      error: 'At least one field (title, description, status) must be provided for update.'
    });
  }

  // Schema-level validation for update
  const validation = Task.validate({ title, description, status }, true);
  if (!validation.isValid) {
    return res.status(400).json({
      error: validation.errors[0],
      details: validation.errors
    });
  }

  next();
};

/**
 * Validate query parameters on GET /api/tasks (e.g. ?status=pending)
 */
const validateQueryParams = (req, res, next) => {
  const { status } = req.query;

  if (status !== undefined && !ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Invalid status query parameter. Status must be one of: ${ALLOWED_STATUSES.join(', ')}.`
    });
  }

  next();
};

module.exports = {
  validateTaskId,
  validateContentType,
  validateCreateTask,
  validateUpdateTask,
  validateQueryParams
};
