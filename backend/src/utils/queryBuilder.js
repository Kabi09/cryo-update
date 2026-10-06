const buildPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  return { page, limit, skip, sort };
};

const buildFilter = (query, searchableFields = [], exactFilterKeys = []) => {
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  exactFilterKeys.forEach((key) => {
    if (query[key]) {
      filter[key] = query[key];
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

  if (query.search && searchableFields.length > 0) {
    const searchRegex = new RegExp(query.search.trim(), 'i');
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
