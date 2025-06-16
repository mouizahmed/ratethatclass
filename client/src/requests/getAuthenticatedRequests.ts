import React from 'react';
import axios from 'axios';
import { Review } from '@/types/review';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { VoteState } from '@/types/requests';
import { getIdToken, handleApiError, getRequestConfig } from '@/lib/api-utils';
import { Report, ReportStatus } from '@/types/report';
import { BannedUser } from '@/types/user';
import { AdminUser } from '@/types/admin';
import { PaginationMeta } from '@/types/api';

const API_TIMEOUT = 10000;

export async function getVoteStates(reviewIds: string[]): Promise<VoteState[]> {
  const idToken = await getIdToken();
  let url = `${process.env.NEXT_PUBLIC_URL}/review/votes`;
  if (reviewIds.length > 0) {
    url += `?review_ids=${reviewIds.join(',')}`;
  }
  try {
    const response = await axios.get<ApiResponse<VoteState[]>>(url, {
      ...getRequestConfig(idToken),
      timeout: API_TIMEOUT,
    });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to retrieve vote states');
    }
    return response.data.data;
  } catch (error) {
    handleApiError(error, 'Failed to retrieve vote states');
  }
}

export async function getUserPosts(
  setListOfReviews: React.Dispatch<React.SetStateAction<Review[]>>,
  page?: number,
  limit?: number,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
): Promise<PaginatedResponse<Review>> {
  const idToken = await getIdToken();
  let url = `${process.env.NEXT_PUBLIC_URL}/user/reviews`;
  if (page !== undefined) {
    url += `?page=${page}&limit=${limit || 10}`;
    if (sortBy) {
      url += `&sort_by=${encodeURIComponent(sortBy)}`;
    }
    if (sortOrder) {
      url += `&sort_order=${encodeURIComponent(sortOrder)}`;
    }
  }
  try {
    const response = await axios.get<ApiResponse<Review[]>>(url, {
      ...getRequestConfig(idToken),
      timeout: API_TIMEOUT,
    });
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to retrieve user's posts");
    }
    setListOfReviews(response.data.data);
    return {
      data: response.data.data,
      meta: {
        current_page: response.data.meta.current_page ?? 1,
        page_size: response.data.meta.page_size ?? (limit || 10),
        total_items: response.data.meta.total_items ?? response.data.data.length,
        total_pages: response.data.meta.total_pages ?? 1,
      },
    };
  } catch (error) {
    handleApiError(error, "Failed to retrieve user's posts");
  }
}

export async function getUserUpvotes(
  setListOfReviews: React.Dispatch<React.SetStateAction<Review[]>>,
  page?: number,
  limit?: number,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
): Promise<PaginatedResponse<Review>> {
  const idToken = await getIdToken();
  let url = `${process.env.NEXT_PUBLIC_URL}/user/upvoted-reviews`;
  if (page !== undefined) {
    url += `?page=${page}&limit=${limit || 10}`;
    if (sortBy) {
      url += `&sort_by=${encodeURIComponent(sortBy)}`;
    }
    if (sortOrder) {
      url += `&sort_order=${encodeURIComponent(sortOrder)}`;
    }
  }
  try {
    const response = await axios.get<ApiResponse<Review[]>>(url, {
      ...getRequestConfig(idToken),
      timeout: API_TIMEOUT,
    });
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to retrieve user's upvotes");
    }
    setListOfReviews(response.data.data);
    return {
      data: response.data.data,
      meta: {
        current_page: response.data.meta.current_page ?? 1,
        page_size: response.data.meta.page_size ?? (limit || 10),
        total_items: response.data.meta.total_items ?? response.data.data.length,
        total_pages: response.data.meta.total_pages ?? 1,
      },
    };
  } catch (error) {
    handleApiError(error, "Failed to retrieve user's upvotes");
  }
}

export async function getUserDownvotes(
  setListOfReviews: React.Dispatch<React.SetStateAction<Review[]>>,
  page?: number,
  limit?: number,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
): Promise<PaginatedResponse<Review>> {
  const idToken = await getIdToken();
  let url = `${process.env.NEXT_PUBLIC_URL}/user/downvoted-reviews`;
  if (page !== undefined) {
    url += `?page=${page}&limit=${limit || 10}`;
    if (sortBy) {
      url += `&sort_by=${encodeURIComponent(sortBy)}`;
    }
    if (sortOrder) {
      url += `&sort_order=${encodeURIComponent(sortOrder)}`;
    }
  }
  try {
    const response = await axios.get<ApiResponse<Review[]>>(url, {
      ...getRequestConfig(idToken),
      timeout: API_TIMEOUT,
    });
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to retrieve user's downvotes");
    }
    setListOfReviews(response.data.data);
    return {
      data: response.data.data,
      meta: {
        current_page: response.data.meta.current_page ?? 1,
        page_size: response.data.meta.page_size ?? (limit || 10),
        total_items: response.data.meta.total_items ?? response.data.data.length,
        total_pages: response.data.meta.total_pages ?? 1,
      },
    };
  } catch (error) {
    handleApiError(error, "Failed to retrieve user's downvotes");
  }
}

export async function getReports(
  page: number = 1,
  limit: number = 10,
  entityType: 'course' | 'review',
  sortBy: string = 'report_date',
  sortOrder: 'asc' | 'desc' = 'desc',
  status?: ReportStatus
): Promise<PaginatedResponse<Report>> {
  try {
    let url = `${process.env.NEXT_PUBLIC_URL}/report?page=${page}&limit=${limit}&entity_type=${entityType}&sort_by=${sortBy}&sort_order=${sortOrder}`;
    if (status) {
      url += `&status=${status}`;
    }
    const idToken = await getIdToken();
    const response = await axios.get<ApiResponse<Report[]>>(url, {
      ...getRequestConfig(idToken),
      timeout: API_TIMEOUT,
    });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to retrieve reports');
    }
    return {
      data: response.data.data,
      meta: {
        current_page: response.data.meta.current_page ?? 1,
        page_size: response.data.meta.page_size ?? limit,
        total_items: response.data.meta.total_items ?? response.data.data.length,
        total_pages: response.data.meta.total_pages ?? 1,
      },
    };
  } catch (error) {
    handleApiError(error, 'Failed to retrieve reports');
  }
}

export async function getBannedUsers(page: number = 1, limit: number = 10): Promise<PaginatedResponse<BannedUser>> {
  try {
    const idToken = await getIdToken();
    const response = await axios.get<ApiResponse<BannedUser[]>>(
      `${process.env.NEXT_PUBLIC_URL}/admin/users/banned?page=${page}&limit=${limit}`,
      {
        ...getRequestConfig(idToken),
        timeout: API_TIMEOUT,
      }
    );
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to retrieve banned users');
    }
    return {
      data: response.data.data,
      meta: response.data.meta as PaginationMeta,
    };
  } catch (error) {
    handleApiError(error, 'Failed to retrieve banned users');
  }
}

export async function getAdmins(): Promise<ApiResponse<AdminUser[]>> {
  try {
    const idToken = await getIdToken();
    const response = await axios.get<ApiResponse<AdminUser[]>>(`${process.env.NEXT_PUBLIC_URL}/admin/admins`, {
      ...getRequestConfig(idToken),
      timeout: API_TIMEOUT,
    });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to retrieve admins');
    }
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to retrieve admins');
  }
}
