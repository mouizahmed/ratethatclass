import { Course, Department, Professor, RequestedUniversity, University } from '@/types/university';
import { Review } from '@/types/review';
import { ApiResponse, PaginatedResponse } from '@/types/api';

// const API_TIMEOUT = 3000;

export async function getUniversities(): Promise<University[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/university`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error('Could not retrieve universities');
    }

    const data: ApiResponse<University[]> = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to retrieve universities');
    }

    return data.data;
  } catch (error) {
    console.log(error);
    return [] as University[];
  }
}

export async function getRequestedUniversities(): Promise<RequestedUniversity[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/university/request-university-list`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Could not retrieve requested universities.');
    }

    const data: ApiResponse<RequestedUniversity[]> = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to retrieve requested universities');
    }

    return data.data;
  } catch (error) {
    console.log(error);
    throw new Error('Could not retrieve requested universities.');
  }
}

export async function getUniversity(universityName: string): Promise<University> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/university/name/${universityName}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    const data: ApiResponse<University> = await response.json();

    if (!data.success || !data.data.university_id) {
      return {} as University; // Return empty university object to trigger notFound()
    }
    return data.data;
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

    const response = await fetch(url);

    if (!response.ok) {
      console.log('Failed to get departments');
      return [];
    }

    const data: ApiResponse<Department[]> = await response.json();

    if (!data.success) {
      console.log(`Failed to get departments: ${data.message}`);
      return [];
    }

    return data.data;
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
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Error retrieving course list.');
    }

    const data: ApiResponse<Course[]> = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to retrieve courses');
    }

    return {
      data: data.data,
      meta: {
        current_page: data.meta.current_page ?? 1,
        page_size: data.meta.page_size ?? limit,
        total_items: data.meta.total_items ?? data.data.length,
        total_pages: data.meta.total_pages ?? 1,
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/professor/courseID/${courseID}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.log('Failed to get professors');
      return [];
    }

    const data: ApiResponse<Professor[]> = await response.json();

    if (!data.success) {
      console.log(`Failed to get professors: ${data.message}`);
      return [];
    }

    return data.data;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getCourseByCourseTag(universityID: string, courseTag: string): Promise<Course> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/course/universityID/${universityID}/courseTag/${courseTag}`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    const data: ApiResponse<Course> = await response.json();

    if (!data.success || !data.data.course_id) {
      return {} as Course; // Return empty course object to trigger notFound()
    }

    return data.data;
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

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Could not retrieve Reviews.');
    }

    const data: ApiResponse<Review[]> = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to retrieve reviews');
    }

    return {
      data: data.data,
      meta: {
        current_page: data.meta.current_page ?? 1,
        page_size: data.meta.page_size ?? (limit || 10),
        total_items: data.meta.total_items ?? data.data.length,
        total_pages: data.meta.total_pages ?? 1,
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
