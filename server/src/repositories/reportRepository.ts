import { pool } from '../db/db';
import { createReport, getReportsPaginated, getReportsCount, addAnonymousUser } from '../db/queries';
import { Report, ReportStatus, ValidReportEntityType } from '../types';

export class ReportRepository {
  async createReport(
    userId: string,
    entityType: ValidReportEntityType,
    entityId: string,
    reportReason: string
  ): Promise<{ report_id: string }> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // First ensure the user exists in the users table
      await client.query(addAnonymousUser, [userId]);

      const result = await client.query(createReport, [userId, entityType, entityId, reportReason.trim()]);
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getReports(
    page: number,
    limit: number,
    entityType: ValidReportEntityType,
    status: ReportStatus | null,
    sortBy: string,
    sortOrder: string
  ): Promise<{ reports: Report[]; total: number }> {
    const offset = (page - 1) * limit;
    const reportsResult = await pool.query(getReportsPaginated, [limit, offset, entityType, status, sortBy, sortOrder]);
    const countResult = await pool.query(getReportsCount, [entityType, status]);
    const total = parseInt(countResult.rows[0].count, 10);

    return {
      reports: reportsResult.rows as Report[],
      total,
    };
  }

  async validateEntityExists(entityType: ValidReportEntityType, entityId: string): Promise<boolean> {
    if (entityType === 'course') {
      const result = await pool.query('SELECT 1 FROM courses WHERE course_id = $1', [entityId]);
      return result.rows.length > 0;
    } else if (entityType === 'review') {
      const result = await pool.query('SELECT 1 FROM reviews WHERE review_id = $1', [entityId]);
      return result.rows.length > 0;
    }
    return false;
  }
}
