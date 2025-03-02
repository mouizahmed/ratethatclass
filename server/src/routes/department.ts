import express, { Request, Response } from 'express';
import { getDepartments, getDepartmentByUniversityID, getDepartmentByID, addDepartment } from '../db/queries';
import { pool } from '../db/db';
import { Department } from 'types';
import { validateUUID } from '../helpers';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(getDepartments);
    res.json(result.rows as Department[]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});

router.get('/universityID/:universityID', async (req: Request, res: Response) => {
  const { universityID } = req.params;
  try {
    validateUUID(universityID);

    const result = await pool.query(getDepartmentByUniversityID, [universityID]);
    if (result.rows.length == 0) {
      res.json([]);
    } else {
      res.json(result.rows as Department[]);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});

router.get('/id/:departmentID', async (req: Request, res: Response) => {
  const { departmentID } = req.params;
  try {
    validateUUID(departmentID);

    const result = await pool.query(getDepartmentByID, [departmentID]);
    if (result.rows.length == 0) {
      res.json({});
    } else {
      res.json(result.rows[0] as Department);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});

router.post('/add', async (req: Request, res: Response) => {
  const { departmentName, universityID } = req.body;

  try {
    if (!departmentName || !universityID)
      throw new Error('Please enter a department name the university ID it belongs to.');
    await pool.query(addDepartment, [departmentName, universityID]);
    res.json({
      message: `Department '${departmentName}' successfully added.`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
});

export default router;
