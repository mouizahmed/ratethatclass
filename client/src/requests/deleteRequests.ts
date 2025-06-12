import { getCurrentUser } from '@/firebase/auth';
import { ApiResponse } from '@/types/api';
import axios from 'axios';

async function getIdToken() {
  const currentUser = await getCurrentUser();
  return currentUser ? await currentUser.getIdToken(true) : '';
}

export async function deleteReview(reviewId: string) {
  try {
    const currentUser = await getCurrentUser();
    let idToken = '';
    if (currentUser) idToken = await currentUser.getIdToken(true);

    const response = await axios.delete(`${process.env.NEXT_PUBLIC_URL}/review/${reviewId}`, {
      withCredentials: true,
      headers: {
        id_token: idToken,
      },
    });

    return response;
  } catch (error) {
    throw error;
  }
}

export async function deleteReviewReport(reportId: string): Promise<void> {
  const idToken = await getIdToken();
  const response = await axios
    .delete<ApiResponse<Record<string, never>>>(`${process.env.NEXT_PUBLIC_URL}/admin/reports/${reportId}/reviews`, {
      headers: { id_token: idToken },
    })
    .catch((error) => {
      console.error(error);
      throw new Error('Could not delete review.');
    });

  if (!response.data.success) {
    throw new Error(response.data.message || 'Could not delete review.');
  }
}

export async function deleteCourseReport(reportId: string): Promise<void> {
  const idToken = await getIdToken();
  const response = await axios
    .delete<ApiResponse<Record<string, never>>>(`${process.env.NEXT_PUBLIC_URL}/admin/reports/${reportId}/courses`, {
      headers: { id_token: idToken },
    })
    .catch((error) => {
      console.error(error);
      throw new Error('Could not delete course.');
    });

  if (!response.data.success) {
    throw new Error(response.data.message || 'Could not delete course.');
  }
}

export async function deleteDepartmentReport(reportId: string): Promise<void> {
  const idToken = await getIdToken();
  const response = await axios
    .delete<ApiResponse<Record<string, never>>>(
      `${process.env.NEXT_PUBLIC_URL}/admin/reports/${reportId}/departments`,
      {
        headers: { id_token: idToken },
      }
    )
    .catch((error) => {
      console.error(error);
      throw new Error('Could not delete department.');
    });

  if (!response.data.success) {
    throw new Error(response.data.message || 'Could not delete department.');
  }
}

export async function deleteProfessorReport(reportId: string): Promise<void> {
  const idToken = await getIdToken();
  const response = await axios
    .delete<ApiResponse<Record<string, never>>>(`${process.env.NEXT_PUBLIC_URL}/admin/reports/${reportId}/professors`, {
      headers: { id_token: idToken },
    })
    .catch((error) => {
      console.error(error);
      throw new Error('Could not delete professor.');
    });

  if (!response.data.success) {
    throw new Error(response.data.message || 'Could not delete professor.');
  }
}
