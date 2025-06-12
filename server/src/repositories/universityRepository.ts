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

  async requestUniversity(name: string) {
    const result = await pool.query(requestUniversity, [name.trim()]);
    return result.rows[0] as RequestedUniversity;
  }

  async upvoteRequestedUniversity(universityId: string, token: string) {
    await pool.query(upvoteRequestedUniversity, [universityId, token]);
    await pool.query(updateTotalVotesRequestedUniversity, [universityId]);
  }
}
