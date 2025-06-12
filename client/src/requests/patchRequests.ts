import axios from 'axios';
import { getCurrentUser } from '../firebase/auth';
import { ApiResponse } from '@/types/api';

async function getIdToken() {
  const currentUser = await getCurrentUser();
  return currentUser ? await currentUser.getIdToken(true) : '';
}

export async function dismissReport(reportId: string): Promise<void> {
  const idToken = await getIdToken();
  const response = await axios
    .patch<ApiResponse<Record<string, never>>>(
      `${process.env.NEXT_PUBLIC_URL}/admin/reports/${reportId}/dismiss`,
      {},
      {
        headers: { id_token: idToken },
      }
    )
    .catch((error) => {
      console.log(error);
      throw new Error('Could not dismiss report.');
    });

  if (!response.data.success) {
    throw new Error(response.data.message || 'Could not dismiss report.');
  }
}

export async function unbanUser(userId: string): Promise<void> {
  const idToken = await getIdToken();
  const response = await axios
    .patch<ApiResponse<Record<string, never>>>(
      `${process.env.NEXT_PUBLIC_URL}/admin/users/${userId}/unban`,
      {},
      {
        headers: { id_token: idToken },
      }
    )
    .catch((error) => {
      console.log(error);
      throw new Error('Could not unban user');
    });

  if (!response.data.success) {
    throw new Error(response.data.message || 'Could not unban user');
  }
}
