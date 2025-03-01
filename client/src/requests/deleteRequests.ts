import { getCurrentUser } from '@/firebase/auth';
import axios from 'axios';

export async function deleteReview(reviewID: string) {
  try {
    const currentUser = await getCurrentUser();
    let idToken = '';
    if (currentUser) idToken = await currentUser.getIdToken(true);

    const response = await axios.delete(`${process.env.NEXT_PUBLIC_URL}/review/delete/id/${reviewID}`, {
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
