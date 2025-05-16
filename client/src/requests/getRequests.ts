import React from 'react';
import axios from 'axios';
import { getCurrentUser } from '../firebase/auth';
import { Course, Department, Professor, RequestedUniversity, University } from '@/types/university';
import { Review } from '@/types/review';
import { ApiResponse, PaginatedResponse } from '@/types/api';

const API_TIMEOUT = 3000;

export async function getUniversities(): Promise<University[]> {
  const response = await axios
    .get<ApiResponse<University[]>>(`${process.env.NEXT_PUBLIC_URL}/university`, { timeout: API_TIMEOUT })
    .catch((error) => {
      console.log(error);
      throw new Error('Could not retrieve universities');
    });

  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to retrieve universities');
  }

  return response.data.data;
}

export async function getRequestedUniversities(): Promise<RequestedUniversity[]> {
  const response = await axios
    .get<ApiResponse<RequestedUniversity[]>>(`${process.env.NEXT_PUBLIC_URL}/university/request-university-list`, {
      withCredentials: true,
    })
    .catch((error) => {
      console.log(error);
      throw new Error('Could not retrieve requested universities.');
    });

  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to retrieve requested universities');
  }

  return response.data.data;
}

export async function getUniversity(universityName: string): Promise<University> {
  const response = await axios
    .get<ApiResponse<University>>(`${process.env.NEXT_PUBLIC_URL}/university/name/${universityName}`, {
      timeout: API_TIMEOUT,
    })
    .catch((error) => {
      console.log(error);
      throw new Error('Error retrieving university data.');
    });

  if (!response.data.success) {
    throw new Error(response.data.message || 'University not found');
  }

  const university = response.data.data;
  if (university.university_id == undefined) {
    throw new Error('University data is incomplete');
  }

  return university;
}

export async function getDepartmentsByUniversityID(universityID: string): Promise<Department[]> {
  return axios
    .get<ApiResponse<Department[]>>(`${process.env.NEXT_PUBLIC_URL}/department/universityID/${universityID}`, {
      timeout: 3000,
    })
    .then((response) => {
      if (!response.data.success) {
        console.log(`Failed to get departments: ${response.data.message}`);
        return [];
      }
      return response.data.data;
    })
    .catch((error) => {
      console.log(error);
      return [];
    });
}

export async function getCoursesByUniversityID(
  universityID: string,
  page: number,
  limit: number,
  search?: string,
  departmentID?: string,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
): Promise<PaginatedResponse<Course>> {
  let url = `${process.env.NEXT_PUBLIC_URL}/course/universityID/${universityID}?page=${page}&limit=${limit}`;

  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }

  if (departmentID) {
    url += `&department_id=${encodeURIComponent(departmentID)}`;
  }

  if (sortBy) {
    url += `&sort_by=${encodeURIComponent(sortBy)}`;
  }

  if (sortOrder) {
    url += `&sort_order=${encodeURIComponent(sortOrder)}`;
  }

  const response = await axios
    .get<ApiResponse<Course[]>>(url, {
      timeout: API_TIMEOUT,
    })
    .catch((error) => {
      console.log(error);
      throw new Error(`Error retrieving course list.`);
    });

  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to retrieve courses');
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
}

export async function getProfessorsByCourseID(courseID: string): Promise<Professor[]> {
  return axios
    .get<ApiResponse<Professor[]>>(`${process.env.NEXT_PUBLIC_URL}/professor/courseID/${courseID}`, {
      timeout: API_TIMEOUT,
    })
    .then((response) => {
      if (!response.data.success) {
        console.log(`Failed to get professors: ${response.data.message}`);
        return [];
      }
      return response.data.data;
    })
    .catch((error) => {
      console.log(error);
      return [];
    });
}

export async function getCourseByCourseTag(universityID: string, courseTag: string): Promise<Course> {
  const response = await axios
    .get<ApiResponse<Course>>(
      `${process.env.NEXT_PUBLIC_URL}/course/universityID/${universityID}/courseTag/${courseTag}`,
      {
        timeout: API_TIMEOUT,
      }
    )
    .catch((error) => {
      console.log(error);
      throw new Error(`Course ${courseTag} does not exist.`);
    });

  if (!response.data.success) {
    throw new Error(response.data.message || `Course ${courseTag} does not exist.`);
  }

  return response.data.data;
}

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
  } else {
    // If page is not specified, set default values
    url += `?page=1&limit=1000`; // Get all reviews with high limit
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
  } else {
    // If page is not specified, set default values to get all reviews
    url += `?page=1&limit=1000`;
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

  // Set the reviews list in the state if a setter is provided
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
  } else {
    // If page is not specified, set default values to get all reviews
    url += `?page=1&limit=1000`;
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

  // Set the reviews list in the state if a setter is provided
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
  } else {
    // If page is not specified, set default values to get all reviews
    url += `?page=1&limit=1000`;
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

  // Set the reviews list in the state if a setter is provided
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
