import express, { Response, Router } from 'express';
import { validateToken } from '../../middleware/Auth';
import { AuthenticatedRequest, Report, ReportStatus, VALID_REPORT_ENTITY_TYPES, ValidReportEntityType } from '../types';
import { pool } from '../db/db';
import { createReport, getReportsPaginated, getReportsCount } from '../db/queries';

const router: Router = express.Router();

router.get('/get-all', async (req: AuthenticatedRequest, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 20);
  const offset = (page - 1) * limit;
  const sortBy = (req.query.sort_by as string) || 'date_created';
  const sortOrder = (req.query.sort_order as string) || 'desc';
  const entityType = req.query.entity_type as string;
  const status = req.query.status as ReportStatus;

  // Validate entity type
  if (!entityType) {
    res.status(400).json({
      success: false,
      message: 'entity_type query parameter is required',
      data: {},
      meta: {},
    });
    return;
  }

  if (!VALID_REPORT_ENTITY_TYPES.includes(entityType as ValidReportEntityType)) {
    res.status(400).json({
      success: false,
      message: `Invalid entity_type. Must be one of: ${VALID_REPORT_ENTITY_TYPES.join(', ')}`,
      data: {},
      meta: {},
    });
    return;
  }

  try {
    const result = await pool.query(getReportsPaginated, [limit, offset, entityType, status, sortBy, sortOrder]);
    const countResult = await pool.query(getReportsCount, [entityType, status]);

    const totalItems = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      message: 'Reports fetched successfully',
      data: result.rows,
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

router.post('/create', validateToken, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { reportDetails }: { reportDetails: Report } = req.body;
    const user = req.user;

    // Validate entity exists before creating report
    if (reportDetails.entity_type === 'course') {
      const courseExists = await pool.query('SELECT 1 FROM courses WHERE course_id = $1', [reportDetails.entity_id]);
      if (!courseExists.rows.length) {
        res.status(404).json({
          success: false,
          message: 'Course not found',
          data: {},
          meta: {},
        });
        return;
      }
    } else if (reportDetails.entity_type === 'review') {
      const reviewExists = await pool.query('SELECT 1 FROM reviews WHERE review_id = $1', [reportDetails.entity_id]);
      if (!reviewExists.rows.length) {
        res.status(404).json({
          success: false,
          message: 'Review not found',
          data: {},
          meta: {},
        });
        return;
      }
    }

    const report = await pool.query(createReport, [
      user.uid,
      reportDetails.entity_type,
      reportDetails.entity_id,
      reportDetails.report_reason.trim(),
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
