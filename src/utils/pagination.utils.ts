

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const parsePaginationOptions = (query: any): Required<PaginationOptions> => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

  return {
    page,
    limit,
    sortBy,
    sortOrder,
  };
};

export const createPaginationQuery = (
  options: Required<PaginationOptions>
): {
  skip: number;
  take: number;
  orderBy: Record<string, 'asc' | 'desc'>;
} => {
  const { page, limit, sortBy, sortOrder } = options;
  const skip = (page - 1) * limit;

  return {
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
  };
};

export const createPaginationResult = <T>(
  data: T[],
  total: number,
  options: Required<PaginationOptions>
): PaginationResult<T> => {
  const { page, limit } = options;
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};
