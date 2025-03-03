import React from 'react';
import axios from 'axios';
import { getCurrentUser } from '../firebase/auth';
import { Course, Department, Professor, RequestedUniversity, University } from '@/types/university';
import { Review } from '@/types/review';

const API_TIMEOUT = 3000;

export async function getUniversities() {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_URL}/university`, { timeout: API_TIMEOUT });

    // setMaxPages(Math.ceil(response.data.length / 6));
    return response.data;
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

    return response.data as RequestedUniversity[];
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
    if (response.data.university_id == undefined) throw new Error();
    return response.data as University;
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

export async function getCoursesByUniversityID(universityID: string) {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_URL}/course/universityID/${universityID}`, {
      timeout: API_TIMEOUT,
    });

    return response.data as Course[];
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

export async function getReviewsByCourseID(courseID: string) {
  try {
    const currentUser = await getCurrentUser();
    let idToken = '';
    if (currentUser) idToken = await currentUser.getIdToken(true);

    const response = await axios.get(`${process.env.NEXT_PUBLIC_URL}/review/courseID/${courseID}`, {
      headers: {
        id_token: idToken,
      },
      timeout: API_TIMEOUT,
    });

    return response.data as Review[];
  } catch (error) {
    console.log(error);
    throw new Error('Could not retrive Reviews.');
  }
}

export async function getUserPosts(setListOfReviews: React.Dispatch<React.SetStateAction<Review[]>>) {
  try {
    const currentUser = await getCurrentUser();
    let idToken = '';
    if (currentUser) idToken = await currentUser.getIdToken(true);

    const response = await axios.get(`${process.env.NEXT_PUBLIC_URL}/user/reviews`, {
      headers: {
        id_token: idToken,
      },
      timeout: API_TIMEOUT,
    });
    setListOfReviews(response.data);
  } catch (error) {
    console.log(error);
    throw new Error("Could not retrieve user's posts.");
  }
}

export async function getUserUpvotes(setListOfReviews: React.Dispatch<React.SetStateAction<Review[]>>) {
  try {
    const currentUser = await getCurrentUser();
    let idToken = '';
    if (currentUser) idToken = await currentUser.getIdToken(true);

    const response = await axios.get(`${process.env.NEXT_PUBLIC_URL}/user/upvotes`, {
      headers: {
        id_token: idToken,
      },
      timeout: API_TIMEOUT,
    });
    setListOfReviews(response.data);
  } catch (error) {
    console.log(error);
    throw new Error("Could not retrieve user's upvotes.");
  }
}

export async function getUserDownvotes(setListOfReviews: React.Dispatch<React.SetStateAction<Review[]>>) {
  try {
    const currentUser = await getCurrentUser();
    let idToken = '';
    if (currentUser) idToken = await currentUser.getIdToken(true);

    const response = await axios.get(`${process.env.NEXT_PUBLIC_URL}/user/downvotes`, {
      headers: {
        id_token: idToken,
      },
      timeout: API_TIMEOUT,
    });
    setListOfReviews(response.data);
  } catch (error) {
    console.log(error);
    throw new Error("Could not retrieve user's downvotes.");
  }
}
