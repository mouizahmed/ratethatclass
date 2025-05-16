import express, { Request, Response } from 'express';
import { pool } from '../db/db';
import { getProfessors, getProfessorsByUniversityID, getProfessorsByCourseID } from '../db/queries';
import { Professor } from 'types';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(getProfessors);
    res.json({
      success: true,
      message: 'Professors fetched successfully',
      data: result.rows as Professor[],
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
    const result = await pool.query(getProfessorsByUniversityID, [universityID]);
    res.json({
      success: true,
      message: 'Professors fetched successfully',
      data: result.rows as Professor[],
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
    const result = await pool.query(getProfessorsByCourseID, [courseID]);
    res.json({
      success: true,
      message: 'Professors fetched successfully',
      data: result.rows as Professor[],
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
