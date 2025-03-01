import axios from 'axios';
import { getCurrentUser } from '../firebase/auth';
import { Course } from '@/types/university';
import { Review } from '@/types/review';

async function getIdToken() {
  const currentUser = await getCurrentUser();
  return currentUser ? await currentUser.getIdToken(true) : '';
}

export async function registerAccount(displayName: string, email: string, password: string) {
  try {
    // const idToken = await getIdToken();
    const user = await axios.post(`${process.env.NEXT_PUBLIC_URL}/user/register`, {
      display_name: displayName,
      email: email,
      password: password,
    });

    return user.data.token;
  } catch (error) {
    throw error;
  }
}

export async function postReview(review: Review) {
  try {
    const idToken = await getIdToken();
    await axios.post(
      `${process.env.NEXT_PUBLIC_URL}/review/add`,
      {
        reviewData: review,
      },
      {
        headers: {
          id_token: idToken,
        },
      }
    );
  } catch (error) {
    console.log(error);
    throw new Error('Could not post review.');
  }
}

export async function postCourse(course: Course, review: Review) {
  try {
    const idToken = await getIdToken();
    await axios.post(
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
    );
  } catch (error) {
    console.log(error);
    throw new Error('Could not post course.');
  }
}

export async function postUpVote(review: Review) {
  try {
    const idToken = await getIdToken();
    await axios.post(
      `${process.env.NEXT_PUBLIC_URL}/review/upvote`,
      { review_id: review.review_id },
      { headers: { id_token: idToken } }
    );
  } catch (error) {
    console.log(error);
    throw new Error('Could not post upvote.');
  }
}

export async function postDownVote(review: Review) {
  try {
    const idToken = await getIdToken();
    await axios.post(
      `${process.env.NEXT_PUBLIC_URL}/review/downvote`,
      { review_id: review.review_id },
      { headers: { id_token: idToken } }
    );
  } catch (error) {
    console.log('Error posting downvote:', error);
    throw new Error('Could not post downvote.');
  }
}

export async function postUniversityRequest(universityName: string) {
  try {
    // axios.defaults.withCredentials = true;
    await axios.post(
      `${process.env.NEXT_PUBLIC_URL}/university/request-university`,
      {
        universityName: universityName,
      },
      {
        withCredentials: true,
      }
    );
  } catch (error) {
    console.log(error);
    throw new Error('Could not request university.');
  }
}

export async function postReport(entityID: string, reason: string, type: string) {
  try {
    const idToken = await getIdToken();
    await axios.post(
      `${process.env.NEXT_PUBLIC_URL}/report/create`,
      {
        reportDetails: {
          entity_id: entityID,
          reason: reason,
          entity_type: type.toLowerCase(),
        },
      },
      { headers: { id_token: idToken } }
    );
  } catch (error) {
    console.log(error);
    throw new Error('Could not send report.');
  }
}
