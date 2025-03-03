import express, { Response } from 'express';
import { validateToken } from '../../middleware/Auth';
import { AuthenticatedRequest, Report } from 'types';
import { pool } from '../db/db';
import { createReport } from '../db/queries';

const router = express.Router();

router.post('/create', validateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { reportDetails }: { reportDetails: Report } = req.body;
  const user = req.user;
  const report = await pool.query(createReport, [
    user.uid,
    reportDetails.entity_type,
    reportDetails.entity_id,
    reportDetails.report_reason.trim(),
  ]);

  res.json({ message: `Report ID ${report.rows[0].report_id} created.` });

  try {
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

export default router;
