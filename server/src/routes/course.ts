import express, { Request, Response } from 'express';
import { pool } from '../db/db';
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
import { AuthenticatedRequest, Course, Review, Evaluation, Grade, Workload, Textbook } from '../types';
import { PoolClient } from 'pg';
import { validateToken } from '../../middleware/Auth';

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

router.get('/by-university-id/:universityId', async (req: Request, res: Response) => {
  const { universityId } = req.params;
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 20);
  const offset = (page - 1) * limit;
  const search = (req.query.search as string) || null;
  const sortBy = (req.query.sort_by as string) || 'overall_score';
  const sortOrder = (req.query.sort_order as string) || 'desc';
  const departmentId = (req.query.department_id as string) || null;

  try {
    const coursesResult = await pool.query(getCoursesByUniversityId, [
      universityId,
      limit,
      offset,
      search,
      departmentId,
      sortBy,
      sortOrder,
    ]);
    const totalCount = await pool.query(getCoursesByUniversityIdCount, [universityId, search, departmentId]);

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

router.get('/by-department-id/:departmentId', async (req: Request, res: Response) => {
  const { departmentId } = req.params;

  try {
    const result = await pool.query(getCoursesByDepartmentId, [departmentId]);
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

router.get('/by-id/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query(getCoursesByCourseId, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({
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

router.get('/by-university-id/:universityId/by-tag/:courseTag', async (req: Request, res: Response) => {
  const { universityId, courseTag } = req.params;

  try {
    const result = await pool.query(getCoursesByCourseTag, [courseTag, universityId]);
    if (result.rows.length === 0) {
      res.status(404).json({
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

router.post('/', validateToken, async (req: AuthenticatedRequest, res: Response) => {
  let client: PoolClient;

  try {
    const { courseData, reviewData }: { courseData: Course; reviewData: Review } = req.body;

    // Validate courseData structure and required fields
    if (
      !courseData ||
      !courseData.department_name ||
      !courseData.university_id ||
      !courseData.course_tag ||
      !courseData.course_name
    ) {
      res.status(400).json({
        success: false,
        message: 'Missing required course data',
        data: {},
        meta: {},
      });
      return;
    }

    // Validate courseData required fields are non-empty after trimming
    if (
      !courseData.department_name.trim() ||
      !courseData.university_id.trim() ||
      !courseData.course_tag.trim() ||
      !courseData.course_name.trim()
    ) {
      res.status(400).json({
        success: false,
        message: 'Course data fields cannot be empty',
        data: {},
        meta: {},
      });
      return;
    }

    // Validate courseData text field lengths
    if (
      courseData.department_name.trim().length > 100 ||
      courseData.course_tag.trim().length > 20 ||
      courseData.course_name.trim().length > 200
    ) {
      res.status(400).json({
        success: false,
        message: 'Course data fields exceed maximum length limits',
        data: {},
        meta: {},
      });
      return;
    }

    // Validate reviewData structure and required fields
    if (!reviewData || !reviewData.professor_name) {
      res.status(400).json({
        success: false,
        message: 'Missing required review data',
        data: {},
        meta: {},
      });
      return;
    }

    // Validate reviewData required fields are non-empty after trimming
    if (!reviewData.professor_name.trim()) {
      res.status(400).json({
        success: false,
        message: 'Professor name cannot be empty',
        data: {},
        meta: {},
      });
      return;
    }

    // Validate reviewData text field lengths
    if (reviewData.professor_name.trim().length > 100) {
      res.status(400).json({
        success: false,
        message: 'Professor name exceeds maximum length limit',
        data: {},
        meta: {},
      });
      return;
    }

    // Validate optional text fields lengths
    if (reviewData.course_comments && reviewData.course_comments.trim().length > 1000) {
      res.status(400).json({
        success: false,
        message: 'Course comments exceed maximum length limit (1000 characters)',
        data: {},
        meta: {},
      });
      return;
    }

    if (reviewData.professor_comments && reviewData.professor_comments.trim().length > 1000) {
      res.status(400).json({
        success: false,
        message: 'Professor comments exceed maximum length limit (1000 characters)',
        data: {},
        meta: {},
      });
      return;
    }

    if (reviewData.advice_comments && reviewData.advice_comments.trim().length > 1000) {
      res.status(400).json({
        success: false,
        message: 'Advice comments exceed maximum length limit (1000 characters)',
        data: {},
        meta: {},
      });
      return;
    }

    // Validate numeric fields
    if (reviewData.grade !== undefined && reviewData.grade !== null) {
      const validGrades = Object.values(Grade);
      if (!validGrades.includes(reviewData.grade)) {
        res.status(400).json({
          success: false,
          message: `Grade must be one of: ${validGrades.join(', ')}`,
          data: {},
          meta: {},
        });
        return;
      }
    }

    // Validate score fields (1-5 scale)
    const scoreFields = ['overall_score', 'easy_score', 'interest_score', 'useful_score'] as const;
    for (const field of scoreFields) {
      const value = (reviewData as any)[field];
      if (value !== undefined && value !== null) {
        const score = Number(value);
        if (isNaN(score) || score < 1 || score > 5) {
          res.status(400).json({
            success: false,
            message: `${field} must be a number between 1 and 5`,
            data: {},
            meta: {},
          });
          return;
        }
      }
    }

    // Validate workload
    if (reviewData.workload !== undefined && reviewData.workload !== null) {
      const validWorkloads = Object.values(Workload);
      if (!validWorkloads.includes(reviewData.workload)) {
        res.status(400).json({
          success: false,
          message: `Workload must be one of: ${validWorkloads.join(', ')}`,
          data: {},
          meta: {},
        });
        return;
      }
    }

    // Validate textbook_use
    if (reviewData.textbook_use !== undefined && reviewData.textbook_use !== null) {
      const validTextbookUses = Object.values(Textbook);
      if (!validTextbookUses.includes(reviewData.textbook_use)) {
        res.status(400).json({
          success: false,
          message: `Textbook use must be one of: ${validTextbookUses.join(', ')}`,
          data: {},
          meta: {},
        });
        return;
      }
    }

    // Validate evaluation_methods
    if (reviewData.evaluation_methods !== undefined && reviewData.evaluation_methods !== null) {
      if (!Array.isArray(reviewData.evaluation_methods)) {
        res.status(400).json({
          success: false,
          message: 'evaluation_methods must be an array',
          data: {},
          meta: {},
        });
        return;
      }

      const validMethods = Object.values(Evaluation);
      for (const method of reviewData.evaluation_methods) {
        if (!validMethods.includes(method)) {
          res.status(400).json({
            success: false,
            message: `Invalid evaluation method. Must be one of: ${validMethods.join(', ')}`,
            data: {},
            meta: {},
          });
          return;
        }
      }
    }

    // Validate year_taken
    if (reviewData.year_taken !== undefined && reviewData.year_taken !== null) {
      const year = Number(reviewData.year_taken);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1950 || year > currentYear) {
        res.status(400).json({
          success: false,
          message: `Year taken must be between 1950 and ${currentYear}`,
          data: {},
          meta: {},
        });
        return;
      }
    }

    const user = req.user;

    client = await pool.connect();
    await client.query('BEGIN');

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

    const course = await client.query(addCourse, [
      departmentId,
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
      reviewData.course_comments?.trim() || '',
      reviewData.professor_comments?.trim() || '',
      reviewData.advice_comments?.trim() || '',
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
    }
  }
});

export default router;
