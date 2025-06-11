import express, { Request, Response } from 'express';
import { pool } from '../db/db';
import {
  getProfessorsPaginated,
  getProfessorsCount,
  getProfessorsByUniversityIdPaginated,
  getProfessorsByUniversityIdCount,
  getProfessorsByCourseIdPaginated,
  getProfessorsByCourseIdCount,
} from '../db/queries';
import { Professor } from 'types';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 20);
  const offset = (page - 1) * limit;
  const search = (req.query.search as string) || null;
  const sortBy = (req.query.sort_by as string) || 'professor_name';
  const sortOrder = (req.query.sort_order as string) || 'asc';

  try {
    const result = await pool.query(getProfessorsPaginated, [limit, offset, search, sortBy, sortOrder]);
    const countResult = await pool.query(getProfessorsCount, [search]);

    const totalItems = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      message: 'Professors fetched successfully',
      data: result.rows as Professor[],
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
  const sortBy = (req.query.sort_by as string) || 'professor_name';
  const sortOrder = (req.query.sort_order as string) || 'asc';

  try {
    const result = await pool.query(getProfessorsByUniversityIdPaginated, [
      limit,
      offset,
      universityId,
      search,
      sortBy,
      sortOrder,
    ]);
    const countResult = await pool.query(getProfessorsByUniversityIdCount, [universityId, search]);

    const totalItems = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      message: 'Professors fetched successfully',
      data: result.rows as Professor[],
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

router.get('/by-course-id/:courseId', async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 20);
  const offset = (page - 1) * limit;
  const search = (req.query.search as string) || null;
  const sortBy = (req.query.sort_by as string) || 'professor_name';
  const sortOrder = (req.query.sort_order as string) || 'asc';

  try {
    const result = await pool.query(getProfessorsByCourseIdPaginated, [
      limit,
      offset,
      courseId,
      search,
      sortBy,
      sortOrder,
    ]);
    const countResult = await pool.query(getProfessorsByCourseIdCount, [courseId, search]);

    const totalItems = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      message: 'Professors fetched successfully',
      data: result.rows as Professor[],
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

export default router;
