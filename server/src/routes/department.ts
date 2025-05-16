import express, { Request, Response } from 'express';
import { getDepartments, getDepartmentByUniversityID, getDepartmentByID, addDepartment } from '../db/queries';
import { pool } from '../db/db';
import { Department } from 'types';
import { validateUUID } from '../helpers';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(getDepartments);
    res.json({
      success: true,
      message: 'Departments fetched successfully',
      data: result.rows as Department[],
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

router.get('/universityID/:universityID', async (req: Request, res: Response) => {
  const { universityID } = req.params;
  try {
    validateUUID(universityID);

    const result = await pool.query(getDepartmentByUniversityID, [universityID]);
    if (result.rows.length == 0) {
      res.json({
        success: true,
        message: 'No departments found for this university',
        data: [],
        meta: {},
      });
    } else {
      res.json({
        success: true,
        message: 'Departments fetched successfully',
        data: result.rows as Department[],
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
