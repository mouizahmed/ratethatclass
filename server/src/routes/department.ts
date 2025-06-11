import express, { Request, Response } from 'express';
import {
  getDepartmentsPaginated,
  getDepartmentsCount,
  getDepartmentByUniversityId,
  getDepartmentById,
  addDepartment,
} from '../db/queries';
import { pool } from '../db/db';
import { Department } from 'types';
import { validateUUID } from '../helpers';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 20);
  const offset = (page - 1) * limit;
  const search = (req.query.search as string) || null;
  const sortBy = (req.query.sort_by as string) || 'total_reviews';
  const sortOrder = (req.query.sort_order as string) || 'desc';

  try {
    const result = await pool.query(getDepartmentsPaginated, [limit, offset, search, sortBy, sortOrder]);
    const countResult = await pool.query(getDepartmentsCount, [search]);

    const totalItems = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      message: 'Departments fetched successfully',
      data: result.rows as Department[],
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
  const search = (req.query.search as string) || null;
  const sortBy = (req.query.sort_by as string) || 'total_reviews';
  const sortOrder = (req.query.sort_order as string) || 'desc';

  try {
    validateUUID(universityId);

    const result = await pool.query(getDepartmentByUniversityId, [universityId, search, sortBy, sortOrder]);

    res.json({
      success: true,
      message: 'Departments fetched successfully',
      data: result.rows as Department[],
      meta: {
        total_items: result.rows.length,
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

router.get('/by-id/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    validateUUID(id);

    const result = await pool.query(getDepartmentById, [id]);
    if (result.rows.length == 0) {
      res.status(404).json({
        success: false,
        message: 'Department not found',
        data: {},
        meta: {},
      });
    } else {
      res.json({
        success: true,
        message: 'Department fetched successfully',
        data: result.rows[0] as Department,
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

router.post('/', async (req: Request, res: Response) => {
  const { department_name, university_id } = req.body;

  try {
    if (!department_name || !university_id)
      throw new Error('Please enter a department name the university ID it belongs to.');
    await pool.query(addDepartment, [department_name.trim(), university_id]);
    res.json({
      success: true,
      message: `Department '${department_name}' successfully added`,
      data: { department_name: department_name, university_id: university_id },
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

export default router;
