import axios from 'axios';
import { getCurrentUser } from '../firebase/auth';
import { Course } from '@/types/university';
import { Review } from '@/types/review';
import { ApiResponse } from '@/types/api';

async function getIdToken() {
  const currentUser = await getCurrentUser();
  return currentUser ? await currentUser.getIdToken(true) : '';
}

export async function registerAccount(displayName: string, email: string, password: string): Promise<string> {
  const response = await axios
    .post<ApiResponse<{ token: string }>>(`${process.env.NEXT_PUBLIC_URL}/user/register`, {
      display_name: displayName,
      email: email,
      password: password,
    })
    .catch((error) => {
      console.log('ASDASDAD');
      console.log(error);
      throw new Error(error.response.data.message || 'Registration failed. Please try again.');
    });

  if (!response.data.success) {
    throw new Error(response.data.message || 'Registration failed');
  }

  return response.data.data.token;
}

export async function postReview(review: Review): Promise<void> {
  const idToken = await getIdToken();

  const response = await axios
    .post<ApiResponse<Record<string, never>>>(
      `${process.env.NEXT_PUBLIC_URL}/review/add`,
      {
        reviewData: review,
      },
      {
        headers: {
          id_token: idToken,
        },
      }
    )
    .catch((error) => {
      console.log(error);
      throw new Error('Could not post review.');
    });

  if (!response.data.success) {
    throw new Error(response.data.message || 'Could not post review.');
  }
}

export async function postCourse(course: Course, review: Review): Promise<void> {
  const idToken = await getIdToken();

  const response = await axios
    .post<ApiResponse<Record<string, never>>>(
      `${process.env.NEXT_PUBLIC_URL}/course/add`,
      {
        reviewData: review,
        courseData: course,
      },
      {
        headers: {
          id_token: idToken,
        },
      }
    )
    .catch((error) => {
      console.log(error);
      throw new Error('Could not post course.');
    });

  if (!response.data.success) {
    throw new Error(response.data.message || 'Could not post course.');
  }
}

export async function postUpVote(review: Review): Promise<void> {
  const idToken = await getIdToken();
  const response = await axios
    .post<ApiResponse<Record<string, never>>>(
      `${process.env.NEXT_PUBLIC_URL}/review/upvote`,
      { review_id: review.review_id },
      { headers: { id_token: idToken } }
    )
    .catch((error) => {
      console.log(error);
      throw new Error('Could not post upvote.');
    });

  if (!response.data.success) {
    throw new Error(response.data.message || 'Could not post upvote.');
  }
}

export async function postDownVote(review: Review): Promise<void> {
  const idToken = await getIdToken();

  const response = await axios
    .post<ApiResponse<Record<string, never>>>(
      `${process.env.NEXT_PUBLIC_URL}/review/downvote`,
      { review_id: review.review_id },
      { headers: { id_token: idToken } }
    )
    .catch((error) => {
      console.log(error);
      throw new Error('Could not post downvote.');
    });

  if (!response.data.success) {
    throw new Error(response.data.message || 'Could not post downvote.');
  }
}

export async function postUniversityRequest(universityName: string): Promise<void> {
  const response = await axios
    .post<ApiResponse<Record<string, never>>>(
      `${process.env.NEXT_PUBLIC_URL}/university/request-university`,
      {
        universityName: universityName,
      },
      {
        withCredentials: true,
      }
    )
    .catch((error) => {
      console.log(error);
      throw new Error('Could not request university.');
    });

  if (!response.data.success) {
    throw new Error(response.data.message || 'Could not request university.');
  }
}

export async function postReport(entityID: string, reason: string, type: string): Promise<void> {
  const idToken = await getIdToken();

  const response = await axios
    .post<ApiResponse<Record<string, never>>>(
      `${process.env.NEXT_PUBLIC_URL}/report/create`,
      {
        reportDetails: {
          entity_id: entityID,
          reason: reason,
          entity_type: type.toLowerCase(),
        },
      },
      { headers: { id_token: idToken } }
    )
    .catch((error) => {
      console.log(error);
      throw new Error('Could not send report.');
    });

  if (!response.data.success) {
    throw new Error(response.data.message || 'Could not send report.');
  }
}
