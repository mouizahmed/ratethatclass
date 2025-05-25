import { ReactNode } from 'react';
import { Review } from './review';

export interface NewCourse {
  course_tag: string;
  course_name: string;
  department_name: string;
  department_id: string;
  university_tag: string;
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
