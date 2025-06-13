import axios from 'axios';
import { getIdToken, handleApiError, getRequestConfig } from '@/lib/api-utils';

export async function voteUniversity(universityId: string): Promise<void> {
  const idToken = await getIdToken();
  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_URL}/university/requests/${universityId}/vote`,
      {},
      { ...getRequestConfig(idToken), withCredentials: true }
    );
    if (!response.data.success) {
      throw new Error(response.data.message || 'Could not post vote for university');
    }
  } catch (error) {
    handleApiError(error, 'Could not post vote for university');
  }
}
