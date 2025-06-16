import { pool } from '../db/db';
import { University, RequestedUniversity } from '../types';
import {
  getUniversitiesPaginated,
  getUniversitiesCount,
  getUniversityDomains,
  getUniversityById,
  getUniversityByName,
  requestUniversity,
  getRequestedUniversities,
  upvoteRequestedUniversity,
  updateTotalVotesRequestedUniversity,
  checkUniversityDomain,
} from '../db/queries';

export class UniversityRepository {
  async getUniversitiesPaginated(
    limit: number,
    offset: number,
    search: string | null,
    sortBy: string,
    sortOrder: string
  ) {
    const result = await pool.query(getUniversitiesPaginated, [limit, offset, search, sortBy, sortOrder]);
    return result.rows as University[];
  }

  async getUniversitiesCount(search: string | null) {
    const result = await pool.query(getUniversitiesCount, [search]);
    return parseInt(result.rows[0].count, 10);
  }

  async getUniversityByName(name: string) {
    const result = await pool.query(getUniversityByName, [name]);
    return result.rows[0] as University;
  }

  async getUniversityById(id: string) {
    const result = await pool.query(getUniversityById, [id]);
    return result.rows[0] as University;
  }

  async getUniversityDomains() {
    const result = await pool.query(getUniversityDomains);
    return result.rows.map((item) => item.domain) as string[];
  }

  async getRequestedUniversities(token: string) {
    const result = await pool.query(getRequestedUniversities, [token]);
    return result.rows as RequestedUniversity[];
  }

  async upvoteRequestedUniversity(universityId: string, token: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(upvoteRequestedUniversity, [universityId, token]);
      await client.query(updateTotalVotesRequestedUniversity, [universityId]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async requestAndUpvoteUniversity(name: string, token: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(requestUniversity, [name.trim()]);
      const university = result.rows[0];
      await client.query(upvoteRequestedUniversity, [university.university_id, token]);
      await client.query(updateTotalVotesRequestedUniversity, [university.university_id]);
      await client.query('COMMIT');
      return university;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async checkDomainExists(email: string): Promise<boolean> {
    const result = await pool.query(checkUniversityDomain, [email]);
    return result.rows[0].domain_exists;
  }
}
