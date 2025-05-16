/**
 * Standard API response format
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta: {
    current_page?: number;
    page_size?: number;
    total_items?: number;
    total_pages?: number;
    [key: string]: unknown;
  };
}

/**
 * Paginated API response metadata
 */
export interface PaginationMeta {
  current_page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

/**
 * Paginated data response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
