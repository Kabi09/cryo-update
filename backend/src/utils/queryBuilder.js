const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const buildPagination = (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  return { page, limit, skip, sort };
};

const buildFilter = (query = {}, searchableFields = [], exactFilterKeys = []) => {
  const filter = {};

  if (query.status && query.status !== 'ALL' && query.status !== 'undefined' && query.status !== 'null' && query.status.trim() !== '') {
    filter.status = query.status.trim();
  }

  exactFilterKeys.forEach((key) => {
    const val = query[key];
    if (val && val !== 'ALL' && val !== 'undefined' && val !== 'null' && typeof val === 'string' && val.trim() !== '') {
      filter[key] = val.trim();
    } else if (val && typeof val !== 'string') {
      filter[key] = val;
    }
  });

  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) {
      filter.createdAt.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      filter.createdAt.$lte = new Date(query.endDate);
    }
  }

  if (query.search && typeof query.search === 'string' && query.search.trim() !== '' && searchableFields.length > 0) {
    const escaped = escapeRegex(query.search.trim());
    const searchRegex = new RegExp(escaped, 'i');
    filter.$or = searchableFields.map((field) => ({ [field]: searchRegex }));
  }

  return filter;
};

const formatPaginatedResult = (data, total, page, limit) => {
  return {
    items: data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1
    }
  };
};

module.exports = {
  buildPagination,
  buildFilter,
  formatPaginatedResult
};
