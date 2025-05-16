import express, { Request, Response } from 'express';
import {
  getDepartments,
  getDepartmentsPaginated,
  getDepartmentsCount,
  getDepartmentByUniversityID,
  getDepartmentByUniversityIDPaginated,
  getDepartmentByUniversityIDCount,
  getDepartmentByID,
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
  const sortBy = (req.query.sort_by as string) || 'department_name';
  const sortOrder = (req.query.sort_order as string) || 'asc';

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

router.get('/universityID/:universityID', async (req: Request, res: Response) => {
  const { universityID } = req.params;
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 20);
  const offset = (page - 1) * limit;
  const search = (req.query.search as string) || null;
  const sortBy = (req.query.sort_by as string) || 'department_name';
  const sortOrder = (req.query.sort_order as string) || 'asc';

  try {
    validateUUID(universityID);

    const result = await pool.query(getDepartmentByUniversityIDPaginated, [
      limit,
      offset,
      universityID,
      search,
      sortBy,
      sortOrder,
    ]);
    const countResult = await pool.query(getDepartmentByUniversityIDCount, [universityID, search]);

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

router.get('/id/:departmentID', async (req: Request, res: Response) => {
  const { departmentID } = req.params;
  try {
    validateUUID(departmentID);

    const result = await pool.query(getDepartmentByID, [departmentID]);
    if (result.rows.length == 0) {
      res.json({
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

router.post('/add', async (req: Request, res: Response) => {
  const { departmentName, universityID } = req.body;

  try {
    if (!departmentName || !universityID)
      throw new Error('Please enter a department name the university ID it belongs to.');
    await pool.query(addDepartment, [departmentName.trim(), universityID]);
    res.json({
      success: true,
      message: `Department '${departmentName}' successfully added`,
      data: { department_name: departmentName, university_id: universityID },
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
