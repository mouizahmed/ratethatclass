import express, { Request, Response } from 'express';
import { pool } from '../db/db';
import { getProfessors, getProfessorsByUniversityID, getProfessorsByCourseID } from '../db/queries';
import { Professor } from 'types';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(getProfessors);
    res.json(result.rows as Professor[]);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

router.get('/universityID/:universityID', async (req: Request, res: Response) => {
  const { universityID } = req.params;

  try {
    const result = await pool.query(getProfessorsByUniversityID, [universityID]);
    res.json(result.rows as Professor[]);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

router.get('/courseID/:courseID', async (req: Request, res: Response) => {
  const { courseID } = req.params;

  try {
    const result = await pool.query(getProfessorsByCourseID, [courseID]);
    res.json(result.rows as Professor[]);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

// router.post('/add', async (req: Request, res: Response) => {
//   const { universityID, professorName, departmentID } = req.body;

//   let client;

//   try {
//     client = await pool.connect();
//     await client.query('BEGIN');
//     const professorTable = await client.query(addProfessor, [universityID, professorName]);
//     const professorID = professorTable.rows[0].professorID;

//     await client.query(linkProfessorToDepartment, [professorID, departmentID]);

//     await client.query('COMMIT');

//     res.json({
//       message: `Professor '${professorName}' successfully added and linked to departmentID: ${departmentID}.`,
//     });
//   } catch (error) {
//     if (client) {
//       await client.query('ROLLBACK');
//     }
//     console.log(error);
//     res.json({ error: error.message });
//   } finally {
//     if (client) {
//       client.release();
//     } else {
//       console.error('Failed to acquire a database client.');
//       res.status(500).json({
//         error: 'Failed to acquire a database client. Please try again later.',
//       });
//     }
//   }
// });

export default router;
