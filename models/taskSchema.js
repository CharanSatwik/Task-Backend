const { TASK_STATUSES, ALLOWED_STATUSES, VALIDATION_LIMITS } = require('../config/constants');

/**
 * Task Entity Schema
 * Represents a single task in the system with schema validation and sanitization.
 */
class Task {
  /**
   * @param {Object} params
   * @param {number} params.id - Auto-generated unique identifier
   * @param {string} params.title - Title of the task (required)
   * @param {string} [params.description=''] - Optional description
   * @param {string} [params.status=TASK_STATUSES.PENDING] - Status ('pending' | 'in-progress' | 'completed')
   * @param {string} [params.created_at] - ISO 8601 creation timestamp
   */
  constructor({ id, title, description = '', status = TASK_STATUSES.PENDING, created_at }) {
    this.id = id;
    this.title = title.trim();
    this.description = typeof description === 'string' ? description.trim() : '';
    this.status = status || TASK_STATUSES.PENDING;
    this.created_at = created_at || new Date().toISOString();
  }

  /**
   * Validates task attributes against schema definitions
   * @param {Object} attributes
   * @param {boolean} [isUpdate=false]
   * @returns {{ isValid: boolean, errors: string[] }}
   */
  static validate(attributes, isUpdate = false) {
    const errors = [];
    const { title, description, status } = attributes || {};

    // Validate title
    if (!isUpdate || title !== undefined) {
      if (title === undefined || title === null) {
        errors.push('Title is required and must be a non-empty string.');
      } else if (typeof title !== 'string' || title.trim() === '') {
        errors.push('Title must be a non-empty string.');
      } else if (title.trim().length > VALIDATION_LIMITS.TITLE_MAX_LENGTH) {
        errors.push(`Title cannot exceed ${VALIDATION_LIMITS.TITLE_MAX_LENGTH} characters.`);
      }
    }

    // Validate description
    if (description !== undefined) {
      if (typeof description !== 'string') {
        errors.push('Description must be a string.');
      } else if (description.length > VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH) {
        errors.push(`Description cannot exceed ${VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH} characters.`);
      }
    }

    // Validate status
    if (status !== undefined) {
      if (!ALLOWED_STATUSES.includes(status)) {
        errors.push(`Invalid status. Status must be one of: ${ALLOWED_STATUSES.join(', ')}.`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Exports task as plain JSON object
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      created_at: this.created_at
    };
  }
}

module.exports = Task;
