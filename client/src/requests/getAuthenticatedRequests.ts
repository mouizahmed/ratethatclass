import React from 'react';
import axios from 'axios';
import { getCurrentUser } from '../firebase/auth';
import { Review } from '@/types/review';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { VoteState } from '@/types/requests';

const API_TIMEOUT = 3000;

export async function getVoteStates(review_ids: string[]): Promise<VoteState[]> {
  const currentUser = await getCurrentUser();
  let idToken = '';
  if (currentUser) idToken = await currentUser.getIdToken(true);

  let url = `${process.env.NEXT_PUBLIC_URL}/review/votes`;

  if (review_ids.length > 0) {
    url += `?review_ids=${review_ids.join(',')}`;
  }

  const response = await axios.get<ApiResponse<VoteState[]>>(url, {
    headers: {
      id_token: idToken,
    },
    timeout: API_TIMEOUT,
  });

  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to retrieve vote states');
  }

  return response.data.data;
}

export async function getUserPosts(
  setListOfReviews: React.Dispatch<React.SetStateAction<Review[]>>,
  page?: number,
  limit?: number,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
): Promise<PaginatedResponse<Review>> {
  const currentUser = await getCurrentUser();
  let idToken = '';
  if (currentUser) idToken = await currentUser.getIdToken(true);

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

  const response = await axios
    .get<ApiResponse<Review[]>>(url, {
      headers: {
        id_token: idToken,
      },
      timeout: API_TIMEOUT,
    })
    .catch((error) => {
      console.log(error);
      throw new Error("Could not retrieve user's posts.");
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
}

export async function getUserUpvotes(
  setListOfReviews: React.Dispatch<React.SetStateAction<Review[]>>,
  page?: number,
  limit?: number,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
): Promise<PaginatedResponse<Review>> {
  const currentUser = await getCurrentUser();
  let idToken = '';
  if (currentUser) idToken = await currentUser.getIdToken(true);

  let url = `${process.env.NEXT_PUBLIC_URL}/user/upvotes`;

  if (page !== undefined) {
    url += `?page=${page}&limit=${limit || 10}`;

    if (sortBy) {
      url += `&sort_by=${encodeURIComponent(sortBy)}`;
    }

    if (sortOrder) {
      url += `&sort_order=${encodeURIComponent(sortOrder)}`;
    }
  }

  const response = await axios
    .get<ApiResponse<Review[]>>(url, {
      headers: {
        id_token: idToken,
      },
      timeout: API_TIMEOUT,
    })
    .catch((error) => {
      console.log(error);
      throw new Error("Could not retrieve user's upvotes.");
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
}

export async function getUserDownvotes(
  setListOfReviews: React.Dispatch<React.SetStateAction<Review[]>>,
  page?: number,
  limit?: number,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
): Promise<PaginatedResponse<Review>> {
  const currentUser = await getCurrentUser();
  let idToken = '';
  if (currentUser) idToken = await currentUser.getIdToken(true);

  let url = `${process.env.NEXT_PUBLIC_URL}/user/downvotes`;

  if (page !== undefined) {
    url += `?page=${page}&limit=${limit || 10}`;

    if (sortBy) {
      url += `&sort_by=${encodeURIComponent(sortBy)}`;
    }

    if (sortOrder) {
      url += `&sort_order=${encodeURIComponent(sortOrder)}`;
    }
  }

  const response = await axios
    .get<ApiResponse<Review[]>>(url, {
      headers: {
        id_token: idToken,
      },
      timeout: API_TIMEOUT,
    })
    .catch((error) => {
      console.log(error);
      throw new Error("Could not retrieve user's downvotes.");
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
}
