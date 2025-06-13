import { ApiResponse } from '@/types/api';
import axios from 'axios';
import { getIdToken, handleApiError, getRequestConfig } from '@/lib/api-utils';

export async function deleteReview(reviewId: string): Promise<void> {
  const idToken = await getIdToken();

  try {
    const response = await axios.delete<ApiResponse<void>>(
      `${process.env.NEXT_PUBLIC_URL}/review/${reviewId}`,
      getRequestConfig(idToken)
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not delete review');
    }
  } catch (error) {
    handleApiError(error, 'Could not delete review');
  }
}

export async function deleteReviewReport(reportId: string): Promise<void> {
  const idToken = await getIdToken();

  try {
    const response = await axios.delete<ApiResponse<void>>(
      `${process.env.NEXT_PUBLIC_URL}/admin/reports/${reportId}/reviews`,
      getRequestConfig(idToken)
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not delete review');
    }
  } catch (error) {
    handleApiError(error, 'Could not delete review');
  }
}

export async function deleteCourseReport(reportId: string): Promise<void> {
  const idToken = await getIdToken();

  try {
    const response = await axios.delete<ApiResponse<void>>(
      `${process.env.NEXT_PUBLIC_URL}/admin/reports/${reportId}/courses`,
      getRequestConfig(idToken)
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not delete course');
    }
  } catch (error) {
    handleApiError(error, 'Could not delete course');
  }
}

export async function deleteDepartmentReport(reportId: string): Promise<void> {
  const idToken = await getIdToken();

  try {
    const response = await axios.delete<ApiResponse<void>>(
      `${process.env.NEXT_PUBLIC_URL}/admin/reports/${reportId}/departments`,
      getRequestConfig(idToken)
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not delete department');
    }
  } catch (error) {
    handleApiError(error, 'Could not delete department');
  }
}

export async function deleteProfessorReport(reportId: string): Promise<void> {
  const idToken = await getIdToken();

  try {
    const response = await axios.delete<ApiResponse<void>>(
      `${process.env.NEXT_PUBLIC_URL}/admin/reports/${reportId}/professors`,
      getRequestConfig(idToken)
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not delete professor');
    }
  } catch (error) {
    handleApiError(error, 'Could not delete professor');
  }
}

export async function deleteAdmin(adminId: string): Promise<void> {
  const idToken = await getIdToken();

  try {
    const response = await axios.delete<ApiResponse<void>>(
      `${process.env.NEXT_PUBLIC_URL}/admin/admins/${adminId}`,
      getRequestConfig(idToken)
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not delete admin');
    }
  } catch (error) {
    handleApiError(error, 'Could not delete admin');
  }
}
