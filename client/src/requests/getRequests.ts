import { Course, Department, Professor, RequestedUniversity, University } from '@/types/university';
import { Review } from '@/types/review';
import { ApiResponse, PaginatedResponse, PaginationMeta } from '@/types/api';
import axios from 'axios';
import { handleApiError } from '@/lib/api-utils';

// const API_TIMEOUT = 3000;

export async function getUniversities(): Promise<University[]> {
  try {
    const response = await axios.get<ApiResponse<University[]>>(`${process.env.NEXT_PUBLIC_URL}/university`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to retrieve universities');
    }
    return response.data.data;
  } catch (error) {
    handleApiError(error, 'Failed to retrieve universities');
  }
}

export async function getRequestedUniversities(): Promise<RequestedUniversity[]> {
  try {
    const response = await axios.get<ApiResponse<RequestedUniversity[]>>(
      `${process.env.NEXT_PUBLIC_URL}/university/requests`,
      { withCredentials: true }
    );
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to retrieve requested universities');
    }
    return response.data.data;
  } catch (error) {
    handleApiError(error, 'Failed to retrieve requested universities');
  }
}

export async function getUniversity(universityName: string): Promise<University> {
  try {
    const response = await axios.get<ApiResponse<University>>(
      `${process.env.NEXT_PUBLIC_URL}/university/by-name/${universityName}`
    );
    if (!response.data.success || !response.data.data.university_id) {
      return {} as University;
    }
    return response.data.data;
  } catch (error) {
    console.log(error);
    // handleApiError(error, 'Failed to retrieve university');
    return {} as University;
  }
}

export async function getDepartmentsByUniversityId(
  universityId: string,
  search?: string,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
): Promise<Department[]> {
  try {
    let url = `${process.env.NEXT_PUBLIC_URL}/department/by-university-id/${universityId}`;
    const params = new URLSearchParams();
    if (search) {
      params.append('search', search);
    }
    if (sortBy) {
      params.append('sort_by', sortBy);
    }
    if (sortOrder) {
      params.append('sort_order', sortOrder);
    }
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    const response = await axios.get<ApiResponse<Department[]>>(url);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to retrieve departments');
    }
    return response.data.data;
  } catch (error) {
    handleApiError(error, 'Failed to retrieve departments');
  }
}

export async function getCoursesByUniversityId(
  universityId: string,
  page: number,
  limit: number,
  search?: string,
  departmentId?: string,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
): Promise<PaginatedResponse<Course>> {
  let url = `${process.env.NEXT_PUBLIC_URL}/course/by-university-id/${universityId}?page=${page}&limit=${limit}`;
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  if (departmentId) {
    url += `&department_id=${encodeURIComponent(departmentId)}`;
  }
  if (sortBy) {
    url += `&sort_by=${encodeURIComponent(sortBy)}`;
  }
  if (sortOrder) {
    url += `&sort_order=${encodeURIComponent(sortOrder)}`;
  }
  try {
    const response = await axios.get<ApiResponse<Course[]>>(url);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to retrieve courses');
    }
    return {
      data: response.data.data,
      meta: response.data.meta as PaginationMeta,
    };
  } catch (error) {
    handleApiError(error, 'Failed to retrieve courses');
  }
}

export async function getProfessorsByCourseId(courseId: string): Promise<Professor[]> {
  try {
    const response = await axios.get<ApiResponse<Professor[]>>(
      `${process.env.NEXT_PUBLIC_URL}/professor/by-course-id/${courseId}`
    );
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to retrieve professors');
    }
    return response.data.data;
  } catch (error) {
    handleApiError(error, 'Failed to retrieve professors');
  }
}

export async function getCourseByCourseTag(universityId: string, courseTag: string): Promise<Course> {
  try {
    const response = await axios.get<ApiResponse<Course>>(
      `${process.env.NEXT_PUBLIC_URL}/course/by-university-id/${universityId}/by-tag/${courseTag}`
    );
    if (!response.data.success || !response.data.data.course_id) {
      return {} as Course;
    }
    return response.data.data;
  } catch (error) {
    // handleApiError(error, 'Failed to retrieve course');
    console.log(error);
    return {} as Course;
  }
}

export async function getReviewsByCourseId(
  courseId: string,
  page?: number,
  limit?: number,
  professorId?: string,
  term?: string,
  deliveryMethod?: string,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
): Promise<PaginatedResponse<Review>> {
  try {
    let url = `${process.env.NEXT_PUBLIC_URL}/review/by-course-id/${courseId}`;
    if (page !== undefined) {
      url += `?page=${page}&limit=${limit || 10}`;
      if (professorId) {
        url += `&professor_id=${encodeURIComponent(professorId)}`;
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
    const response = await axios.get<ApiResponse<Review[]>>(url);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to retrieve reviews');
    }
    return {
      data: response.data.data,
      meta: response.data.meta as PaginationMeta,
    };
  } catch (error) {
    handleApiError(error, 'Failed to retrieve reviews');
  }
}
