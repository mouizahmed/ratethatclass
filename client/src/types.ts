import { User as FirebaseUser } from 'firebase/auth';
import { ReactNode } from 'react';
import { Review } from './types/review';

export interface NewCourse {
  course_tag: string;
  course_name: string;
  department_name: string;
  department_id: string;
  university_tag: string;
}

export type UserError = {
  message: string;
};

export interface AuthenticationContext {
  userLoggedIn: boolean;
  isEmailUser: boolean;
  currentUser: FirebaseUser | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<FirebaseUser | null>>;
}

export interface UserFormContextType {
  courseForm: NewCourse;
  setCourseForm: React.Dispatch<React.SetStateAction<NewCourse>>;
  reviewForm: Review;
  setReviewForm: React.Dispatch<React.SetStateAction<Review>>;
  step: string;
  setStep: React.Dispatch<React.SetStateAction<string>>;
  newDepartment: {
    get: boolean;
    set: React.Dispatch<React.SetStateAction<boolean>>;
  };
  newProfessor: {
    get: boolean;
    set: React.Dispatch<React.SetStateAction<boolean>>;
  };
}

export type ReactChildren = {
  children: ReactNode;
};

export interface Alert {
  type: AlertType;
  message: string;
  timeout: number | 3000;
  id: string;
}

export type AlertType = 'default' | 'destructive';

export type SQLDate = `${number}-${number}-${number}`;

export const sortingType = ['Reviews', 'Course Name', 'Overall', 'Easiness', 'Interest', 'Usefulness'];

export interface Search {
  type: string;
}

export interface BreadcrumbInfo {
  link: string | null;
  label: string;
}
