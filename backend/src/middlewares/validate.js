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

      if (rule.required && (val === undefined || val === null || (typeof val === 'string' && val.trim() === ''))) {
        errors.push({ field, message: `${field} is required` });
        continue;
      }

      if (val !== undefined && val !== null && val !== '') {
        if (rule.type === 'string') {
          if (typeof val !== 'string') {
            body[field] = String(val);
          }
        } else if (rule.type === 'number') {
          const num = typeof val === 'number' ? val : Number(val);
          if (isNaN(num)) {
            errors.push({ field, message: `${field} must be a valid number` });
          } else {
            body[field] = num;
          }
        } else if (rule.type === 'boolean') {
          if (typeof val === 'boolean') {
            // ok
          } else if (val === 'true' || val === '1' || val === 1) {
            body[field] = true;
          } else if (val === 'false' || val === '0' || val === 0) {
            body[field] = false;
          } else {
            errors.push({ field, message: `${field} must be a boolean` });
          }
        } else if (rule.type === 'array') {
          if (Array.isArray(val)) {
            // ok
          } else if (typeof val === 'string' && val.trim() !== '') {
            body[field] = [val];
          } else {
            errors.push({ field, message: `${field} must be an array` });
          }
        } else if (rule.type === 'object') {
          if (typeof val !== 'object' || Array.isArray(val)) {
            errors.push({ field, message: `${field} must be an object` });
          }
        }

        if (rule.enum && !rule.enum.includes(body[field])) {
          errors.push({
            field,
            message: `${field} must be one of [${rule.enum.join(', ')}]`
          });
        }

        if (rule.min !== undefined && typeof body[field] === 'number' && body[field] < rule.min) {
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
