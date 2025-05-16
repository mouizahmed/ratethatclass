import express, { Request, Response } from 'express';
import { pool } from '../db/db';
import {
  getCourses,
  getCoursesByUniversityID,
  getCoursesByDepartmentID,
  getCoursesByCourseID,
  addCourse,
  getCoursesByCourseTag,
  getDepartmentID,
  addDepartment,
  addProfessor,
  addReview,
  addUpvote,
  getCoursesByUniversityIDCount,
  getCoursesCount,
} from '../db/queries';
import { AuthenticatedRequest, Course, Review } from 'types';
import { PoolClient } from 'pg';
import { validateToken } from '../../middleware/Auth';
import { isEmailVerified } from '../helpers';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 20);
  const offset = (page - 1) * limit;
  const search = (req.query.search as string) || null;
  const sortBy = (req.query.sort_by as string) || 'overall_score';
  const sortOrder = (req.query.sort_order as string) || 'desc';

  try {
    const result = await pool.query(getCourses, [limit, offset, search, sortBy, sortOrder]);
    const countResult = await pool.query(getCoursesCount, [search]);

    const totalItems = parseInt(countResult.rows[0].count, 0);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      message: 'Courses fetched successfully',
      data: result.rows as Course[],
      meta: {
        current_page: page,
        page_size: limit,
        total_items: totalItems,
        total_pages: totalPages,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: {},
      meta: {},
    });
  }
});

router.get('/universityID/:universityID', async (req: Request, res: Response) => {
  const { universityID } = req.params;
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 20);
  const offset = (page - 1) * limit;
  const search = (req.query.search as string) || null;
  const sortBy = (req.query.sort_by as string) || 'overall_score';
  const sortOrder = (req.query.sort_order as string) || 'desc';
  const departmentID = (req.query.department_id as string) || null;

  try {
    const coursesResult = await pool.query(getCoursesByUniversityID, [
      universityID,
      limit,
      offset,
      search,
      departmentID,
      sortBy,
      sortOrder,
    ]);
    const totalCount = await pool.query(getCoursesByUniversityIDCount, [universityID, search, departmentID]);

    const totalItems = parseInt(totalCount.rows[0].count, 0);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      message: 'Courses fetched successfully',
      data: coursesResult.rows as Course[],
      meta: {
        current_page: page,
        page_size: limit,
        total_items: totalItems,
        total_pages: totalPages,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: {},
      meta: {},
    });
  }
});

router.get('/departmentID/:departmentID', async (req: Request, res: Response) => {
  const { departmentID } = req.params;

  try {
    const result = await pool.query(getCoursesByDepartmentID, [departmentID]);
    res.json({
      success: true,
      message: 'Courses fetched successfully',
      data: result.rows as Course[],
      meta: {},
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: {},
      meta: {},
    });
  }
});

router.get('/courseID/:courseID', async (req: Request, res: Response) => {
  const { courseID } = req.params;

  try {
    const result = await pool.query(getCoursesByCourseID, [courseID]);
    if (result.rows.length === 0) {
      res.json({
        success: false,
        message: 'Course not found',
        data: {},
        meta: {},
      });
    } else {
      res.json({
        success: true,
        message: 'Course fetched successfully',
        data: result.rows[0] as Course,
        meta: {},
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: {},
      meta: {},
    });
  }
});

router.get('/universityID/:universityID/courseTag/:courseTag', async (req: Request, res: Response) => {
  const { universityID, courseTag } = req.params;

  try {
    const result = await pool.query(getCoursesByCourseTag, [courseTag, universityID]);
    if (result.rows.length === 0) {
      res.json({
        success: false,
        message: 'Course not found',
        data: {},
        meta: {},
      });
    } else {
      res.json({
        success: true,
        message: 'Course fetched successfully',
        data: result.rows[0] as Course,
        meta: {},
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: {},
      meta: {},
    });
  }
});

router.post('/add', validateToken, async (req: AuthenticatedRequest, res: Response) => {
  let client: PoolClient;

  try {
    const { courseData, reviewData }: { courseData: Course; reviewData: Review } = req.body;
    const user = req.user;

    isEmailVerified(user);

    client = await pool.connect();
    await client.query('BEGIN');

    let departmentID = '';
    const department = await client.query(getDepartmentID, [courseData.department_name, courseData.university_id]);

    if (!department.rows.length) {
      const newDepartment = await client.query(addDepartment, [
        courseData.department_name.trim(),
        courseData.university_id.trim(),
      ]);
      departmentID = newDepartment.rows[0].department_id;
    } else {
      departmentID = department.rows[0].department_id;
    }

    const course = await client.query(addCourse, [
      departmentID,
      courseData.course_tag.trim(),
      courseData.course_name.trim(),
    ]);

    const newProfessor = await client.query(addProfessor, [reviewData.professor_name.trim(), course.rows[0].course_id]);

    const review = await client.query(addReview, [
      course.rows[0].course_id,
      newProfessor.rows[0].professor_id,
      user.uid,
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
      reviewData.course_comments.trim(),
      reviewData.professor_comments.trim(),
      reviewData.advice_comments.trim(),
    ]);

    await client.query(addUpvote, [user.uid, review.rows[0].review_id]);

    await client.query('COMMIT');
    res.json({
      success: true,
      message: 'Course and review successfully added',
      data: {
        course_id: course.rows[0].course_id,
        review_id: review.rows[0].review_id,
      },
      meta: {},
    });
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: {},
      meta: {},
    });
  } finally {
    if (client) {
      client.release();
    } else {
      console.log('Failed to acquire a database client.');
      res.status(500).json({
        success: false,
        message: 'Failed to acquire a database client',
        data: {},
        meta: {},
      });
    }
  }
});

export default router;
