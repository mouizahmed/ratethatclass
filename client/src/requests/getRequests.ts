import React from 'react';
import axios from 'axios';
import { getCurrentUser } from '../firebase/auth';
import { Course, Department, Professor, RequestedUniversity, University } from '@/types/university';
import { Review } from '@/types/review';

const API_TIMEOUT = 3000;

export async function getUniversities() {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_URL}/university`, { timeout: API_TIMEOUT });
    return response.data.data as University[];
  } catch (error) {
    console.log(error);
    throw new Error('Could not retrieve universities');
  }
}

export async function getRequestedUniversities() {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_URL}/university/request-university-list`, {
      withCredentials: true,
    });

    return response.data.data as RequestedUniversity[];
  } catch (error) {
    console.log(error);
    throw new Error('Could not retrieve requested universities.');
  }
}

export async function getUniversity(universityName: string) {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_URL}/university/name/${universityName}`, {
      timeout: API_TIMEOUT,
    });

    const university: University = response.data.data;

    if (university.university_id == undefined) throw new Error();
    return university;
  } catch (error) {
    console.log(error);
    throw new Error('Error retrieving university data.');
  }
}

export async function getDepartmentsByUniversityID(universityID: string): Promise<Department[]> {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_URL}/department/universityID/${universityID}`, {
      timeout: 3000,
    });

    return response.data as Department[];
  } catch (error) {
    console.log(error);
    return [] as Department[];
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
) {
  try {
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

    const response = await axios.get(url, {
      timeout: API_TIMEOUT,
    });

    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error(`Error retrieving course list.`);
  }
}

export async function getProfessorsByCourseID(courseID: string) {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_URL}/professor/courseID/${courseID}`, {
      timeout: API_TIMEOUT,
    });

    return response.data as Professor[];
  } catch (error) {
    console.log(error);
    return [] as Professor[];
    // throw new Error(`Could not retrieve professors`);
  }
}

export async function getCourseByCourseTag(universityID: string, courseTag: string) {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_URL}/course/universityID/${universityID}/courseTag/${courseTag}`,
      { timeout: API_TIMEOUT }
    );
    if (!response.data) throw new Error();

    return response.data as Course;
  } catch (error) {
    console.log(error);
    throw new Error(`Course ${courseTag} does not exist.`);
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
) {
  try {
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

    const response = await axios.get(url, {
      headers: {
        id_token: idToken,
      },
      timeout: API_TIMEOUT,
    });

    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error('Could not retrieve Reviews.');
  }
}

export async function getUserPosts(
  setListOfReviews: React.Dispatch<React.SetStateAction<Review[]>>,
  page?: number,
  limit?: number,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
) {
  try {
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

    const response = await axios.get(url, {
      headers: {
        id_token: idToken,
      },
      timeout: API_TIMEOUT,
    });

    console.log(response.data);

    if (page !== undefined) {
      return response.data;
    } else {
      setListOfReviews(response.data);
      return response.data;
    }
  } catch (error) {
    console.log(error);
    throw new Error("Could not retrieve user's posts.");
  }
}

export async function getUserUpvotes(
  setListOfReviews: React.Dispatch<React.SetStateAction<Review[]>>,
  page?: number,
  limit?: number,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
) {
  try {
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

    const response = await axios.get(url, {
      headers: {
        id_token: idToken,
      },
      timeout: API_TIMEOUT,
    });

    if (page !== undefined) {
      return response.data;
    } else {
      setListOfReviews(response.data);
      return response.data;
    }
  } catch (error) {
    console.log(error);
    throw new Error("Could not retrieve user's upvotes.");
  }
}

export async function getUserDownvotes(
  setListOfReviews: React.Dispatch<React.SetStateAction<Review[]>>,
  page?: number,
  limit?: number,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
) {
  try {
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

    const response = await axios.get(url, {
      headers: {
        id_token: idToken,
      },
      timeout: API_TIMEOUT,
    });

    if (page !== undefined) {
      return response.data;
    } else {
      setListOfReviews(response.data);
      return response.data;
    }
  } catch (error) {
    console.log(error);
    throw new Error("Could not retrieve user's downvotes.");
  }
}
