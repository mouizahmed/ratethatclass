import { z } from 'zod';
import { Course } from '@/types/university';

// Parameterized Course Schema with duplicate check
export const getCourseSchema = (courseList: Course[]) =>
  z
    .object({
      courseName: z.string().min(1, 'Course name is required'),
      courseTag: z.string().min(1, 'Course tag is required'),
      departmentName: z.string().min(1, 'Department name is required'),
      newDepartment: z.boolean().default(false),
    })
    .refine((data) => !courseList.some((course) => course.course_tag === data.courseTag), {
      message: 'This course tag already exists',
      path: ['courseTag'], // attach error to the courseTag field
    });

// Existing schemas
export const reviewRatingSchema = z.object({
  overallScore: z.number().min(0).max(5),
  easyScore: z.number().min(0).max(5),
  interestScore: z.number().min(0).max(5),
  usefulScore: z.number().min(0).max(5),
});

export const reviewMetadataSchema = z.object({
  professorName: z.string().min(1, 'Professor name is required'),
  newProfessor: z.boolean().default(false),
  grade: z.string().min(1, 'Grade is required'),
  deliveryMethod: z.string().min(1, 'Delivery Method is required'),
  workload: z.string().min(1, 'Workload is required'),
  textbookUse: z.string().min(1, 'Textbook Use is required'),
  evaluationMethods: z.record(z.string(), z.string()),
  termTaken: z.string().min(1, 'Term is required'),
  yearTaken: z.string().min(1, 'Year Taken is required'),
});

export const reviewCommentsSchema = z.object({
  courseComments: z.string().min(1, 'Course Comments are required'),
  professorComments: z.string(),
  adviceComments: z.string(),
});

// Schema for new course form that includes the course duplication check
export const getNewCourseFormSchema = (courseList: Course[]) =>
  z.object({
    courseStep: getCourseSchema(courseList),
    reviewRatingsStep: reviewRatingSchema,
    reviewMetadataStep: reviewMetadataSchema,
    reviewCommentsStep: reviewCommentsSchema,
  });

// Schema for new review form (without courseStep)
export const newReviewForm = z.object({
  reviewRatingsStep: reviewRatingSchema,
  reviewMetadataStep: reviewMetadataSchema,
  reviewCommentsStep: reviewCommentsSchema,
});
