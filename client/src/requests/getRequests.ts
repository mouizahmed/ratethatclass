import { Course, Department, Professor, RequestedUniversity, University } from '@/types/university';
import { Review } from '@/types/review';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { Report, ReportStatus } from '@/types/report';
import { BannedUser } from '../types/bannedUser';
import { auth } from '@/firebase/firebase';
import axios from 'axios';

// const API_TIMEOUT = 3000;

async function getIdToken() {
  const currentUser = auth.currentUser;
  return currentUser ? await currentUser.getIdToken(true) : '';
}

export async function getUniversities(): Promise<University[]> {
  try {
    const response = await axios.get<ApiResponse<University[]>>(`${process.env.NEXT_PUBLIC_URL}/university`);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to retrieve universities');
    }

    return response.data.data;
  } catch (error) {
    console.log(error);
    return [] as University[];
  }
}

export async function getRequestedUniversities(): Promise<RequestedUniversity[]> {
  try {
    const response = await axios.get<ApiResponse<RequestedUniversity[]>>(
      `${process.env.NEXT_PUBLIC_URL}/university/request-university-list`,
      { withCredentials: true }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to retrieve requested universities');
    }

    return response.data.data;
  } catch (error) {
    console.log(error);
    throw new Error('Could not retrieve requested universities.');
  }
}

export async function getUniversity(universityName: string): Promise<University> {
  try {
    const response = await axios.get<ApiResponse<University>>(
      `${process.env.NEXT_PUBLIC_URL}/university/name/${universityName}`
    );

    if (!response.data.success || !response.data.data.university_id) {
      return {} as University; // Return empty university object to trigger notFound()
    }
    return response.data.data;
  } catch (error) {
    console.log(error);
    return {} as University; // Return empty university object to trigger notFound()
  }
}

export async function getDepartmentsByUniversityID(
  universityID: string,
  search?: string,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
): Promise<Department[]> {
  try {
    let url = `${process.env.NEXT_PUBLIC_URL}/department/universityID/${universityID}`;

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
      console.log(`Failed to get departments: ${response.data.message}`);
      return [];
    }

    return response.data.data;
  } catch (error) {
    console.log(error);
    return [];
  }
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

  try {
    const response = await axios.get<ApiResponse<Course[]>>(url);

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
  } catch (error) {
    console.log(error);
    return {
      data: [],
      meta: {
        current_page: 1,
        page_size: limit,
        total_items: 0,
        total_pages: 1,
      },
    };
  }
}

export async function getProfessorsByCourseID(courseID: string): Promise<Professor[]> {
  try {
    const response = await axios.get<ApiResponse<Professor[]>>(
      `${process.env.NEXT_PUBLIC_URL}/professor/courseID/${courseID}`
    );

    if (!response.data.success) {
      console.log(`Failed to get professors: ${response.data.message}`);
      return [];
    }

    return response.data.data;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getCourseByCourseTag(universityID: string, courseTag: string): Promise<Course> {
  try {
    const response = await axios.get<ApiResponse<Course>>(
      `${process.env.NEXT_PUBLIC_URL}/course/universityID/${universityID}/courseTag/${courseTag}`
    );

    if (!response.data.success || !response.data.data.course_id) {
      return {} as Course; // Return empty course object to trigger notFound()
    }

    return response.data.data;
  } catch (error) {
    console.log(error);
    return {} as Course; // Return empty course object to trigger notFound()
  }
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
  try {
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

    const response = await axios.get<ApiResponse<Review[]>>(url);

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
  } catch (error) {
    console.log(error);
    return {
      data: [],
      meta: {
        current_page: 1,
        page_size: limit || 10,
        total_items: 0,
        total_pages: 1,
      },
    };
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
    let url = `${process.env.NEXT_PUBLIC_URL}/report/get-all?page=${page}&limit=${limit}&entity_type=${entityType}&sort_by=${sortBy}&sort_order=${sortOrder}`;

    if (status) {
      url += `&status=${status}`;
    }

    const idToken = await getIdToken();
    const response = await axios.get<ApiResponse<Report[]>>(url, {
      headers: { id_token: idToken },
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
    console.log(error);
    return {
      data: [],
      meta: {
        current_page: 1,
        page_size: limit,
        total_items: 0,
        total_pages: 1,
      },
    };
  }
}

export async function getBannedUsers(page: number = 1, limit: number = 10): Promise<ApiResponse<BannedUser[]>> {
  try {
    const idToken = await getIdToken();
    const response = await axios.get<ApiResponse<BannedUser[]>>(
      `${process.env.NEXT_PUBLIC_URL}/admin/users/banned?page=${page}&limit=${limit}`,
      {
        headers: { id_token: idToken },
      }
    );

    return response.data;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: 'Failed to retrieve banned users',
      data: [],
      meta: {
        current_page: 1,
        page_size: 10,
        total_items: 0,
        total_pages: 1,
      },
    };
  }
}
