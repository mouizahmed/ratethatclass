import { pool } from '../db/db';
import { insertBan, unbanUser } from '../db/queries';
import { Report } from '../types';

export class AdminRepository {
  async getReportById(reportId: string): Promise<Report> {
    const reportRes = await pool.query('SELECT * FROM reports WHERE report_id = $1', [reportId]);
    if (!reportRes.rows.length) throw new Error('Report not found');
    return reportRes.rows[0];
  }

  async deleteReviewAndResolveReport(reportId: string, reviewId: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM reviews WHERE review_id = $1', [reviewId]);
      await client.query('UPDATE reports SET status = $1 WHERE report_id = $2', ['resolved', reportId]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteProfessorAndResolveReport(reportId: string, professorId: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM professors WHERE professor_id = $1', [professorId]);
      await client.query('UPDATE reports SET status = $1 WHERE report_id = $2', ['resolved', reportId]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteDepartmentAndResolveReport(reportId: string, departmentId: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM departments WHERE department_id = $1', [departmentId]);
      await client.query('UPDATE reports SET status = $1 WHERE report_id = $2', ['resolved', reportId]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteCourseAndResolveReport(reportId: string, courseId: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM courses WHERE course_id = $1', [courseId]);
      await client.query('UPDATE reports SET status = $1 WHERE report_id = $2', ['resolved', reportId]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async banUser(userId: string, banReason: string, adminId: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(insertBan, [userId, banReason, adminId]);
      await client.query('DELETE FROM reviews WHERE user_id = $1', [userId]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getBannedUsers(page: number, limit: number): Promise<{ users: any[]; total: number }> {
    const offset = (page - 1) * limit;
    const countResult = await pool.query('SELECT COUNT(*) FROM bans WHERE unbanned_at IS NULL');
    const totalItems = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      'SELECT * FROM bans WHERE unbanned_at IS NULL ORDER BY banned_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    return {
      users: result.rows,
      total: totalItems,
    };
  }

  async dismissReport(reportId: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('UPDATE reports SET status = $1 WHERE report_id = $2', ['dismissed', reportId]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async unbanUser(userId: string): Promise<void> {
    const result = await pool.query(unbanUser, [userId]);
    if (result.rowCount === 0) {
      throw new Error('No active ban found for this user');
    }
  }
}
