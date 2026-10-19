/**
 * Application Constants and Configuration
 */

const TASK_STATUSES = Object.freeze({
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed'
});

const ALLOWED_STATUSES = Object.freeze(Object.values(TASK_STATUSES));

const VALIDATION_LIMITS = Object.freeze({
  TITLE_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 255,
  DESCRIPTION_MAX_LENGTH: 2000
});

module.exports = {
  TASK_STATUSES,
  ALLOWED_STATUSES,
  VALIDATION_LIMITS,
  PORT: process.env.PORT || 3000
};
