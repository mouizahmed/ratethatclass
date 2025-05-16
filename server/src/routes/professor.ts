import express, { Request, Response } from 'express';
import { pool } from '../db/db';
import {
  getProfessors,
  getProfessorsPaginated,
  getProfessorsCount,
  getProfessorsByUniversityID,
  getProfessorsByUniversityIDPaginated,
  getProfessorsByUniversityIDCount,
  getProfessorsByCourseID,
  getProfessorsByCourseIDPaginated,
  getProfessorsByCourseIDCount,
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

router.get('/universityID/:universityID', async (req: Request, res: Response) => {
  const { universityID } = req.params;
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 20);
  const offset = (page - 1) * limit;
  const search = (req.query.search as string) || null;
  const sortBy = (req.query.sort_by as string) || 'professor_name';
  const sortOrder = (req.query.sort_order as string) || 'asc';

  try {
    const result = await pool.query(getProfessorsByUniversityIDPaginated, [
      limit,
      offset,
      universityID,
      search,
      sortBy,
      sortOrder,
    ]);
    const countResult = await pool.query(getProfessorsByUniversityIDCount, [universityID, search]);

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

router.get('/courseID/:courseID', async (req: Request, res: Response) => {
  const { courseID } = req.params;
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 20);
  const offset = (page - 1) * limit;
  const search = (req.query.search as string) || null;
  const sortBy = (req.query.sort_by as string) || 'professor_name';
  const sortOrder = (req.query.sort_order as string) || 'asc';

  try {
    const result = await pool.query(getProfessorsByCourseIDPaginated, [
      limit,
      offset,
      courseID,
      search,
      sortBy,
      sortOrder,
    ]);
    const countResult = await pool.query(getProfessorsByCourseIDCount, [courseID, search]);

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
