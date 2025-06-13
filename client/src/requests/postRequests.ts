import axios from 'axios';
import { Course } from '@/types/university';
import { Review } from '@/types/review';
import { ApiResponse } from '@/types/api';
import { getIdToken, handleApiError, getRequestConfig } from '@/lib/api-utils';

export async function registerAccount(displayName: string, email: string, password: string): Promise<string> {
  try {
    const response = await axios.post<ApiResponse<{ token: string }>>(`${process.env.NEXT_PUBLIC_URL}/user/register`, {
      display_name: displayName,
      email: email,
      password: password,
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Registration failed');
    }

    return response.data.data.token;
  } catch (error) {
    handleApiError(error, 'Registration failed. Please try again.');
  }
}

export async function postReview(review: Review): Promise<void> {
  const idToken = await getIdToken();

  try {
    const response = await axios.post<ApiResponse<void>>(
      `${process.env.NEXT_PUBLIC_URL}/review`,
      { data: review },
      getRequestConfig(idToken)
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not post review');
    }
  } catch (error) {
    handleApiError(error, 'Could not post review');
  }
}

export async function postCourse(course: Course, review: Review): Promise<void> {
  const idToken = await getIdToken();

  try {
    const response = await axios.post<ApiResponse<void>>(
      `${process.env.NEXT_PUBLIC_URL}/course`,
      {
        data: {
          course,
          review,
        },
      },
      getRequestConfig(idToken)
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not post course');
    }
  } catch (error) {
    handleApiError(error, 'Could not post course');
  }
}

export async function postVote(review: Review, voteType: 'up' | 'down'): Promise<void> {
  const idToken = await getIdToken();

  try {
    const response = await axios.post<ApiResponse<void>>(
      `${process.env.NEXT_PUBLIC_URL}/review/vote`,
      {
        data: {
          review_id: review.review_id,
          vote_type: voteType,
        },
      },
      getRequestConfig(idToken)
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not post vote');
    }
  } catch (error) {
    handleApiError(error, 'Could not post vote');
  }
}

export async function postUniversityRequest(universityName: string): Promise<void> {
  const idToken = await getIdToken();

  try {
    const response = await axios.post<ApiResponse<void>>(
      `${process.env.NEXT_PUBLIC_URL}/university/requests`,
      {
        data: {
          name: universityName,
        },
      },
      getRequestConfig(idToken)
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not request university');
    }
  } catch (error) {
    handleApiError(error, 'Could not request university');
  }
}

export async function postReport(entityId: string, reason: string, type: string): Promise<void> {
  const idToken = await getIdToken();

  try {
    const response = await axios.post<ApiResponse<void>>(
      `${process.env.NEXT_PUBLIC_URL}/report`,
      {
        data: {
          entity_id: entityId,
          report_reason: reason,
          entity_type: type.toLowerCase(),
        },
      },
      getRequestConfig(idToken)
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not send report');
    }
  } catch (error) {
    handleApiError(error, 'Could not send report');
  }
}

export async function banUser(userId: string): Promise<void> {
  const idToken = await getIdToken();

  try {
    const response = await axios.post<ApiResponse<void>>(
      `${process.env.NEXT_PUBLIC_URL}/admin/users/${userId}/ban`,
      {
        data: {
          ban_reason: 'Violation of community guidelines',
        },
      },
      getRequestConfig(idToken)
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not ban user');
    }
  } catch (error) {
    handleApiError(error, 'Could not ban user');
  }
}

export async function createAdmin(): Promise<ApiResponse<{ email: string; password: string }>> {
  const idToken = await getIdToken();

  try {
    const response = await axios.post<ApiResponse<{ email: string; password: string }>>(
      `${process.env.NEXT_PUBLIC_URL}/admin/admins`,
      {},
      getRequestConfig(idToken)
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not create admin');
    }

    return response.data;
  } catch (error) {
    handleApiError(error, 'Could not create admin');
  }
}
