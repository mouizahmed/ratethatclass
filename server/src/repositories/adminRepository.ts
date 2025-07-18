import { pool } from '../db/db';
import { insertBan, unbanUser } from '../db/queries';
import { Report } from '../types';

export class AdminRepository {
  async getReportById(reportId: string): Promise<Report> {
    const reportRes = await pool.query('SELECT * FROM reports WHERE report_id = $1', [reportId]);
    if (!reportRes.rows.length) throw new Error('Report not found');
    return reportRes.rows[0];
  }

  async resolveAllReportsForEntity(entityType: string, entityId: string): Promise<void> {
    await pool.query('UPDATE reports SET status = $1 WHERE entity_type = $2 AND entity_id = $3 AND status = $4', [
      'resolved',
      entityType,
      entityId,
      'pending',
    ]);
  }

  async deleteReviewAndResolveReport(reportId: string, reviewId: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM reviews WHERE review_id = $1', [reviewId]);
      await this.resolveAllReportsForEntity('review', reviewId);
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
      await this.resolveAllReportsForEntity('professor', professorId);
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
      await this.resolveAllReportsForEntity('department', departmentId);
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
      await this.resolveAllReportsForEntity('course', courseId);
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
      await client.query(
        'UPDATE reports SET status = $1 WHERE entity_type = $2 AND entity_id IN (SELECT review_id FROM reviews WHERE user_id = $3) AND status = $4',
        ['resolved', 'review', userId, 'pending']
      );
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

  async getAllAdmins(): Promise<any[]> {
    const result = await pool.query(
      'SELECT user_id, email, registration_date FROM users WHERE account_type = $1 ORDER BY registration_date DESC',
      ['admin']
    );
    return result.rows;
  }

  async createAdmin(user_id: string, email: string): Promise<void> {
    await pool.query('INSERT INTO users (user_id, email, account_type, registration_date) VALUES ($1, $2, $3, NOW())', [
      user_id,
      email,
      'admin',
    ]);
  }

  async deleteAdmin(user_id: string): Promise<void> {
    await pool.query('DELETE FROM users WHERE user_id = $1', [user_id]);
  }
}
