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
} from '../db/queries';
import { AuthenticatedRequest, Course, Review } from 'types';
import { PoolClient } from 'pg';
import { validateToken } from '../../middleware/Auth';
import { isEmailVerified } from '../helpers';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(getCourses);
    res.json(result.rows as Course[]);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

router.get('/universityID/:universityID', async (req: Request, res: Response) => {
  const { universityID } = req.params;

  try {
    const result = await pool.query(getCoursesByUniversityID, [universityID]);
    res.json(result.rows as Course[]);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

router.get('/departmentID/:departmentID', async (req: Request, res: Response) => {
  const { departmentID } = req.params;

  try {
    const result = await pool.query(getCoursesByDepartmentID, [departmentID]);
    res.json(result.rows as Course[]);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

router.get('/courseID/:courseID', async (req: Request, res: Response) => {
  const { courseID } = req.params;

  try {
    const result = await pool.query(getCoursesByCourseID, [courseID]);
    res.json(result.rows[0] as Course);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

router.get('/universityID/:universityID/courseTag/:courseTag', async (req: Request, res: Response) => {
  const { universityID, courseTag } = req.params;

  try {
    const result = await pool.query(getCoursesByCourseTag, [courseTag, universityID]);
    res.json(result.rows[0] as Course);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
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
      const newDepartment = await client.query(addDepartment, [courseData.department_name, courseData.university_id]);
      departmentID = newDepartment.rows[0].department_id;
    } else {
      departmentID = department.rows[0].department_id;
    }

    const course = await client.query(addCourse, [departmentID, courseData.course_tag, courseData.course_name]);

    const newProfessor = await client.query(addProfessor, [reviewData.professor_name, course.rows[0].course_id]);

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
      reviewData.course_comments,
      reviewData.professor_comments,
      reviewData.advice_comments,
    ]);

    await client.query(addUpvote, [user.uid, review.rows[0].review_id]);

    await client.query('COMMIT');
    res.json({ message: 'Course + Review successfully added.' });
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.log(error);
    res.status(500).send(error.message);
  } finally {
    if (client) {
      client.release();
    } else {
      console.log('Failed to acquire a database client.');
      res.status(500).json({
        error: 'Failed to acquire a database client. Please try again later.',
      });
    }
  }
});

export default router;
