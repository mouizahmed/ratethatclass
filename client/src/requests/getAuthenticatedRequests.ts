import React from 'react';
import axios from 'axios';
import { getCurrentUser } from '../firebase/auth';
import { Review } from '@/types/review';
import { ApiResponse, PaginatedResponse } from '@/types/api';

const API_TIMEOUT = 3000;

export async function getReviewsByCourseID(
  courseID: string,
  page?: number,
  limit?: number,
  professorID?: string,
  term?: string,
  deliveryMethod?: string,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
): Promise<PaginatedResponse<Review>> {
  const currentUser = await getCurrentUser();
  let idToken = '';
  if (currentUser) idToken = await currentUser.getIdToken(true);

  let url = `${process.env.NEXT_PUBLIC_URL}/review/courseID/${courseID}`;

  if (page !== undefined) {
    url += `?page=${page}&limit=${limit || 10}`;

    if (professorID) {
      url += `&professor_id=${encodeURIComponent(professorID)}`;
    }

    if (term) {
      url += `&term=${encodeURIComponent(term)}`;
    }

    if (deliveryMethod) {
      url += `&delivery_method=${encodeURIComponent(deliveryMethod)}`;
    }

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
      throw new Error('Could not retrieve Reviews.');
    });

  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to retrieve reviews');
  }

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