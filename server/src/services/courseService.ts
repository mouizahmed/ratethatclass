import { Course, Review } from '../types';
import { CourseRepository } from '../repositories/courseRepository';
import { InputValidator } from '../validators/inputValidator';

export class CourseService {
  constructor(private courseRepository: CourseRepository) {}

  async getCourses(page: number, limit: number, search: string | null, sortBy: string, sortOrder: string) {
    const offset = (page - 1) * limit;
    const [courses, totalItems] = await Promise.all([
      this.courseRepository.getCourses(limit, offset, search, sortBy, sortOrder),
      this.courseRepository.getCoursesCount(search),
    ]);

    return {
      data: courses,
      meta: {
        current_page: page,
        page_size: limit,
        total_items: totalItems,
        total_pages: Math.ceil(totalItems / limit),
      },
    };
  }

  async getCoursesByUniversityId(
    universityId: string,
    page: number,
    limit: number,
    search: string | null,
    departmentId: string | null,
    sortBy: string,
    sortOrder: string
  ) {
    const offset = (page - 1) * limit;
    const [courses, totalItems] = await Promise.all([
      this.courseRepository.getCoursesByUniversityId(
        universityId,
        limit,
        offset,
        search,
        departmentId,
        sortBy,
        sortOrder
      ),
      this.courseRepository.getCoursesByUniversityIdCount(universityId, search, departmentId),
    ]);

    return {
      data: courses,
      meta: {
        current_page: page,
        page_size: limit,
        total_items: totalItems,
        total_pages: Math.ceil(totalItems / limit),
      },
    };
  }

  async getCoursesByDepartmentId(departmentId: string) {
    const courses = await this.courseRepository.getCoursesByDepartmentId(departmentId);
    return {
      data: courses,
      meta: {},
    };
  }

  async getCourseById(id: string) {
    const course = await this.courseRepository.getCourseById(id);
    if (!course) {
      throw new Error('Course not found');
    }
    return course;
  }

  async getCourseByTag(courseTag: string, universityId: string) {
    const course = await this.courseRepository.getCourseByTag(courseTag, universityId);
    if (!course) {
      throw new Error('Course not found');
    }
    return course;
  }

  async addCourseWithReview(courseData: Course, reviewData: Review, userId: string) {
    // Validate input
    InputValidator.validateCourseAndReview(courseData, reviewData);

    // Add course and review
    const result = await this.courseRepository.addCourseWithReview(courseData, reviewData, userId);
    return result;
  }
}
