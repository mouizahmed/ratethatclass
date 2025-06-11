import express, { Response } from 'express';
import { validateAdmin } from '../../middleware/Auth';
import { AuthenticatedRequest } from 'types';
import { pool } from '../db/db';
import { insertBan, unbanUser } from '../db/queries';
import { auth } from '../../firebase/firebase';

const router = express.Router();

async function getReportById(client: any, report_id: string) {
  const reportRes = await client.query('SELECT * FROM reports WHERE report_id = $1', [report_id]);
  if (!reportRes.rows.length) throw new Error('Report not found');
  return reportRes.rows[0];
}

router.delete('/reports/review', validateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { report_id } = req.query;
    const reportIdStr = report_id as string;
    if (!reportIdStr) {
      res.status(400).json({ success: false, message: 'Missing report_id', data: {}, meta: {} });
      return;
    }
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const report = await getReportById(client, reportIdStr);
      const review_id = report.entity_id;
      // Check if review exists
      const reviewRes = await client.query('SELECT * FROM reviews WHERE review_id = $1', [review_id]);
      if (!reviewRes.rows.length) {
        throw new Error('Review not found');
      }
      await client.query('DELETE FROM reviews WHERE review_id = $1', [review_id]);
      await client.query('UPDATE reports SET status = $1 WHERE report_id = $2', ['resolved', reportIdStr]);
      await client.query('COMMIT');
      res
        .status(200)
        .json({ success: true, message: 'Review deleted and report resolved successfully', data: {}, meta: {} });
    } catch (error) {
      await client.query('ROLLBACK');
      if (error.message === 'Review not found' || error.message === 'Report not found') {
        res.status(404).json({ success: false, message: error.message, data: {}, meta: {} });
        return;
      }
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error', data: {}, meta: {} });
  }
});

// Remove professor by report_id
router.delete('/reports/professor', validateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { report_id } = req.query;
    const reportIdStr = report_id as string;
    if (!reportIdStr) {
      res.status(400).json({ success: false, message: 'Missing report_id', data: {}, meta: {} });
      return;
    }
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const report = await getReportById(client, reportIdStr);
      const review_id = report.entity_id;
      const reviewRes = await client.query('SELECT * FROM reviews WHERE review_id = $1', [review_id]);
      if (!reviewRes.rows.length) {
        throw new Error('Review not found');
      }
      const professor_id = reviewRes.rows[0].professor_id;
      // Check if professor exists
      const profRes = await client.query('SELECT * FROM professors WHERE professor_id = $1', [professor_id]);
      if (!profRes.rows.length) {
        throw new Error('Professor not found');
      }
      await client.query('DELETE FROM professors WHERE professor_id = $1', [professor_id]);
      await client.query('UPDATE reports SET status = $1 WHERE report_id = $2', ['resolved', reportIdStr]);
      await client.query('COMMIT');
      res
        .status(200)
        .json({ success: true, message: 'Professor deleted and report resolved successfully', data: {}, meta: {} });
    } catch (error) {
      await client.query('ROLLBACK');
      if (
        error.message === 'Review not found' ||
        error.message === 'Professor not found' ||
        error.message === 'Report not found'
      ) {
        res.status(404).json({ success: false, message: error.message, data: {}, meta: {} });
        return;
      }
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error', data: {}, meta: {} });
  }
});

router.delete('/reports/department', validateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { report_id } = req.query;
    const reportIdStr = report_id as string;
    if (!reportIdStr) {
      res.status(400).json({ success: false, message: 'Missing report_id', data: {}, meta: {} });
      return;
    }
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const report = await getReportById(client, reportIdStr);
      let department_id = null;
      if (report.entity_type === 'review') {
        const reviewRes = await client.query('SELECT * FROM reviews WHERE review_id = $1', [report.entity_id]);
        if (!reviewRes.rows.length) {
          throw new Error('Review not found');
        }
        department_id = reviewRes.rows[0].department_id;
      } else if (report.entity_type === 'course') {
        const courseRes = await client.query('SELECT * FROM courses WHERE course_id = $1', [report.entity_id]);
        if (!courseRes.rows.length) {
          throw new Error('Course not found');
        }
        department_id = courseRes.rows[0].department_id;
      } else {
        throw new Error('Invalid entity_type for department removal');
      }
      // Check if department exists
      const deptRes = await client.query('SELECT * FROM departments WHERE department_id = $1', [department_id]);
      if (!deptRes.rows.length) {
        throw new Error('Department not found');
      }
      await client.query('DELETE FROM departments WHERE department_id = $1', [department_id]);
      await client.query('UPDATE reports SET status = $1 WHERE report_id = $2', ['resolved', reportIdStr]);
      await client.query('COMMIT');
      res
        .status(200)
        .json({ success: true, message: 'Department deleted and report resolved successfully', data: {}, meta: {} });
    } catch (error) {
      await client.query('ROLLBACK');
      if (
        error.message === 'Review not found' ||
        error.message === 'Department not found' ||
        error.message === 'Report not found' ||
        error.message === 'Course not found' ||
        error.message === 'Invalid entity_type for department removal'
      ) {
        res.status(404).json({ success: false, message: error.message, data: {}, meta: {} });
        return;
      }
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error', data: {}, meta: {} });
  }
});

router.delete('/reports/course', validateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { report_id } = req.query;
    const reportIdStr = report_id as string;
    if (!reportIdStr) {
      res.status(400).json({ success: false, message: 'Missing report_id', data: {}, meta: {} });
      return;
    }
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const report = await getReportById(client, reportIdStr);
      let course_id = null;
      if (report.entity_type === 'review') {
        const reviewRes = await client.query('SELECT * FROM reviews WHERE review_id = $1', [report.entity_id]);
        if (!reviewRes.rows.length) {
          throw new Error('Review not found');
        }
        course_id = reviewRes.rows[0].course_id;
      } else if (report.entity_type === 'course') {
        course_id = report.entity_id;
      } else {
        throw new Error('Invalid entity_type for course removal');
      }
      // Check if course exists
      const courseRes = await client.query('SELECT * FROM courses WHERE course_id = $1', [course_id]);
      if (!courseRes.rows.length) {
        throw new Error('Course not found');
      }
      await client.query('DELETE FROM courses WHERE course_id = $1', [course_id]);
      await client.query('UPDATE reports SET status = $1 WHERE report_id = $2', ['resolved', reportIdStr]);
      await client.query('COMMIT');
      res
        .status(200)
        .json({ success: true, message: 'Course deleted and report resolved successfully', data: {}, meta: {} });
    } catch (error) {
      await client.query('ROLLBACK');
      if (
        error.message === 'Review not found' ||
        error.message === 'Course not found' ||
        error.message === 'Report not found' ||
        error.message === 'Invalid entity_type for course removal'
      ) {
        res.status(404).json({ success: false, message: error.message, data: {}, meta: {} });
        return;
      }
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error', data: {}, meta: {} });
  }
});

router.post('/users/ban', validateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { user_id, ban_reason } = req.body;
    const admin_id = req.user?.uid;
    if (!user_id || !ban_reason || !admin_id) {
      res.status(400).json({
        success: false,
        message: 'Missing user_id, ban_reason, or admin_id',
        data: {},
        meta: {},
      });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(insertBan, [user_id, ban_reason, admin_id]);
      await client.query('DELETE FROM reviews WHERE user_id = $1', [user_id]);
      await client.query('COMMIT');
      // Set custom user claim in Firebase
      await auth.setCustomUserClaims(user_id, { banned: true, ban_reason });
      res.status(200).json({
        success: true,
        message: 'User banned successfully',
        data: {},
        meta: {},
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
      data: {},
      meta: {},
    });
  }
});

router.get('/users/banned', validateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM bans WHERE unbanned_at IS NULL');
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    const result = await pool.query(
      'SELECT * FROM bans WHERE unbanned_at IS NULL ORDER BY banned_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    res.status(200).json({
      success: true,
      message: 'Banned users fetched successfully',
      data: result.rows,
      meta: {
        total_items: totalItems,
        total_pages: totalPages,
        current_page: page,
        items_per_page: limit,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
      data: {},
      meta: {},
    });
  }
});

router.patch('/reports/dismiss', validateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { report_id } = req.query;
    const reportIdStr = report_id as string;
    if (!reportIdStr) {
      res.status(400).json({
        success: false,
        message: 'Missing report_id',
        data: {},
        meta: {},
      });
      return;
    }

    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update report status to dismissed
      await client.query('UPDATE reports SET status = $1 WHERE report_id = $2', ['dismissed', reportIdStr]);

      await client.query('COMMIT');
      res.status(200).json({
        success: true,
        message: 'Report dismissed successfully',
        data: {},
        meta: {},
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
      data: {},
      meta: {},
    });
  }
});

router.patch('/users/unban', validateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      res.status(400).json({
        success: false,
        message: 'Missing user_id',
        data: {},
        meta: {},
      });
      return;
    }
    const result = await pool.query(unbanUser, [user_id]);
    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: 'No active ban found for this user',
        data: {},
        meta: {},
      });
      return;
    }
    // Remove custom user claim in Firebase
    await auth.setCustomUserClaims(user_id, { banned: false, ban_reason: null });
    res.status(200).json({
      success: true,
      message: 'User unbanned successfully',
      data: {},
      meta: {},
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
      data: {},
      meta: {},
    });
  }
});

export default router;
