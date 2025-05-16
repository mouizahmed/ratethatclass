import express, { Response } from 'express';
import { validateToken } from '../../middleware/Auth';
import { AuthenticatedRequest, Report } from 'types';
import { pool } from '../db/db';
import { createReport } from '../db/queries';

const router = express.Router();

router.post('/create', validateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reportDetails }: { reportDetails: Report } = req.body;
    const user = req.user;
    const report = await pool.query(createReport, [
      user.uid,
      reportDetails.entity_type,
      reportDetails.entity_id,
      reportDetails.reason.trim(),
    ]);

    res.json({
      success: true,
      message: 'Report created successfully',
      data: { report_id: report.rows[0].report_id },
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
