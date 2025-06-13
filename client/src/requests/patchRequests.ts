import axios from 'axios';
import { ApiResponse } from '@/types/api';
import { getIdToken, handleApiError, getRequestConfig } from '@/lib/api-utils';

export async function dismissReport(reportId: string): Promise<void> {
  const idToken = await getIdToken();
  try {
    const response = await axios.patch<ApiResponse<Record<string, never>>>(
      `${process.env.NEXT_PUBLIC_URL}/admin/reports/${reportId}/dismiss`,
      {},
      getRequestConfig(idToken)
    );
    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not dismiss report');
    }
  } catch (error) {
    handleApiError(error, 'Could not dismiss report');
  }
}

export async function unbanUser(userId: string): Promise<void> {
  const idToken = await getIdToken();
  try {
    const response = await axios.patch<ApiResponse<Record<string, never>>>(
      `${process.env.NEXT_PUBLIC_URL}/admin/users/${userId}/unban`,
      {},
      getRequestConfig(idToken)
    );
    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not unban user');
    }
  } catch (error) {
    handleApiError(error, 'Could not unban user');
  }
}
