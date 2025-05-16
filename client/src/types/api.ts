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

export interface PaginationMeta {
  current_page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
