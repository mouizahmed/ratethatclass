import { Request, Response, NextFunction } from 'express';

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

declare global {
  namespace Express {
    interface Request {
      pagination: PaginationParams;
    }
  }
}

export const paginationMiddleware = (
  defaultSortBy: string = 'date_uploaded',
  defaultSortOrder: 'asc' | 'desc' = 'desc'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 20);
    const sortBy = (req.query.sort_by as string) || defaultSortBy;
    const sortOrder = ((req.query.sort_order as string) || defaultSortOrder) as 'asc' | 'desc';

    req.pagination = {
      page,
      limit,
      sortBy,
      sortOrder,
    };

    next();
  };
};
