const ApiError = require('../utils/apiError');

/**
 * Validates req.body against a simple rule set.
 * Rules format:
 * {
 *   fieldName: { required: true, type: 'string'|'number'|'boolean'|'array'|'object', enum: [...], min: 0 }
 * }
 */
const validateBody = (rules) => {
  return (req, res, next) => {
    const errors = [];
    const body = req.body || {};

    for (const [field, rule] of Object.entries(rules)) {
      const val = body[field];

      if (rule.required && (val === undefined || val === null || val === '')) {
        errors.push({ field, message: `${field} is required` });
        continue;
      }

      if (val !== undefined && val !== null) {
        if (rule.type === 'string' && typeof val !== 'string') {
          errors.push({ field, message: `${field} must be a string` });
        } else if (rule.type === 'number' && (typeof val !== 'number' || isNaN(val))) {
          errors.push({ field, message: `${field} must be a valid number` });
        } else if (rule.type === 'boolean' && typeof val !== 'boolean') {
          errors.push({ field, message: `${field} must be a boolean` });
        } else if (rule.type === 'array' && !Array.isArray(val)) {
          errors.push({ field, message: `${field} must be an array` });
        } else if (rule.type === 'object' && (typeof val !== 'object' || Array.isArray(val))) {
          errors.push({ field, message: `${field} must be an object` });
        }

        if (rule.enum && !rule.enum.includes(val)) {
          errors.push({
            field,
            message: `${field} must be one of [${rule.enum.join(', ')}]`
          });
        }

        if (rule.min !== undefined && typeof val === 'number' && val < rule.min) {
          errors.push({ field, message: `${field} must be at least ${rule.min}` });
        }
      }
    }

    if (errors.length > 0) {
      return next(ApiError.badRequest('Validation error', errors));
    }

    next();
  };
};

module.exports = { validateBody };
