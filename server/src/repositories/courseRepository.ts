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
  getCoursesByUniversityIdCount,
  getCoursesCount,
  addAnonymousUser,
  lockUniversityCourseTag,
  findCourseInUniversity,
} from '../db/queries';
import { insertReview } from './reviewRepository';
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

      // First ensure the user exists in the users table
      await client.query(addAnonymousUser, [userId]);

      const universityId = courseData.university_id.trim();
      const courseTag = courseData.course_tag.trim();

      // Two requests adding the same course at once (or a course that already exists) must not create a second copy
      await client.query(lockUniversityCourseTag, [universityId, courseTag]);
      let course = (await client.query(findCourseInUniversity, [universityId, courseTag])).rows[0] as Course | undefined;

      if (!course) {
        const departmentName = courseData.department_name.trim();
        const department = await client.query(getDepartmentID, [departmentName, universityId]);
        const departmentId = department.rows.length
          ? department.rows[0].department_id
          : (await client.query(addDepartment, [departmentName, universityId])).rows[0].department_id;

        course = (await client.query(addCourse, [departmentId, courseTag, courseData.course_name])).rows[0] as Course;
      }

      const reviewId = await insertReview(client, course.course_id as string, reviewData, userId);

      await client.query('COMMIT');
      return { course, review: { review_id: reviewId } };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
