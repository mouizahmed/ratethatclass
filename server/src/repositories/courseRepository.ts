import { pool } from '../db/db';
import { Course, Review } from '../types';
import {
  getCourses,
  getCoursesByUniversityId,
  getCoursesByDepartmentId,
  getCoursesByCourseId,
  addCourse,
  getCoursesByCourseTag,
  getDepartmentID,
  addDepartment,
  addProfessor,
  addReview,
  addUpvote,
  getCoursesByUniversityIdCount,
  getCoursesCount,
} from '../db/queries';
import { PoolClient } from 'pg';

export class CourseRepository {
  async getCourses(limit: number, offset: number, search: string | null, sortBy: string, sortOrder: string) {
    const result = await pool.query(getCourses, [limit, offset, search, sortBy, sortOrder]);
    return result.rows as Course[];
  }

  async getCoursesCount(search: string | null) {
    const result = await pool.query(getCoursesCount, [search]);
    return parseInt(result.rows[0].count, 10);
  }

  async getCoursesByUniversityId(
    universityId: string,
    limit: number,
    offset: number,
    search: string | null,
    departmentId: string | null,
    sortBy: string,
    sortOrder: string
  ) {
    const result = await pool.query(getCoursesByUniversityId, [
      universityId,
      limit,
      offset,
      search,
      departmentId,
      sortBy,
      sortOrder,
    ]);
    return result.rows as Course[];
  }

  async getCoursesByUniversityIdCount(universityId: string, search: string | null, departmentId: string | null) {
    const result = await pool.query(getCoursesByUniversityIdCount, [universityId, search, departmentId]);
    return parseInt(result.rows[0].count, 10);
  }

  async getCoursesByDepartmentId(departmentId: string) {
    const result = await pool.query(getCoursesByDepartmentId, [departmentId]);
    return result.rows as Course[];
  }

  async getCourseById(id: string) {
    const result = await pool.query(getCoursesByCourseId, [id]);
    return result.rows[0] as Course;
  }

  async getCourseByTag(courseTag: string, universityId: string) {
    const result = await pool.query(getCoursesByCourseTag, [courseTag, universityId]);
    return result.rows[0] as Course;
  }

  async addCourseWithReview(courseData: Course, reviewData: Review, userId: string) {
    const client: PoolClient = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get or create department
      let departmentId = '';
      const department = await client.query(getDepartmentID, [courseData.department_name, courseData.university_id]);

      if (!department.rows.length) {
        const newDepartment = await client.query(addDepartment, [
          courseData.department_name.trim(),
          courseData.university_id.trim(),
        ]);
        departmentId = newDepartment.rows[0].department_id;
      } else {
        departmentId = department.rows[0].department_id;
      }

      // Add course
      const courseResult = await client.query(addCourse, [departmentId, courseData.course_tag, courseData.course_name]);
      const course = courseResult.rows[0] as Course;

      // Add professor if provided
      let professorId = null;
      if (reviewData.professor_name) {
        const professorResult = await client.query(addProfessor, [reviewData.professor_name, course.course_id]);
        professorId = professorResult.rows[0].professor_id;
      }

      // Add review
      const reviewResult = await client.query(addReview, [
        course.course_id,
        professorId,
        userId,
        reviewData.grade,
        reviewData.delivery_method,
        reviewData.workload,
        reviewData.textbook_use,
        reviewData.evaluation_methods,
        reviewData.overall_score,
        reviewData.easy_score,
        reviewData.interest_score,
        reviewData.useful_score,
        reviewData.term_taken,
        reviewData.year_taken,
        reviewData.course_comments,
        reviewData.professor_comments,
        reviewData.advice_comments,
      ]);

      // Add upvote
      await client.query(addUpvote, [userId, reviewResult.rows[0].review_id]);

      await client.query('COMMIT');
      return { course, review: reviewResult.rows[0] };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
