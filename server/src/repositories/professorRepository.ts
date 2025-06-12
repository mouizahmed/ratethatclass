import { pool } from '../db/db';
import {
  getProfessorsPaginated,
  getProfessorsCount,
  getProfessorsByUniversityIdPaginated,
  getProfessorsByUniversityIdCount,
  getProfessorsByCourseID,
} from '../db/queries';
import { Professor } from '../types';

export class ProfessorRepository {
  async getProfessorsPaginated(
    limit: number,
    offset: number,
    search: string | null,
    sortBy: string,
    sortOrder: string
  ) {
    const result = await pool.query(getProfessorsPaginated, [limit, offset, search, sortBy, sortOrder]);
    return result.rows as Professor[];
  }

  async getProfessorsCount(search: string | null) {
    const result = await pool.query(getProfessorsCount, [search]);
    return parseInt(result.rows[0].count, 10);
  }

  async getProfessorsByUniversityId(
    limit: number,
    offset: number,
    universityId: string,
    search: string | null,
    sortBy: string,
    sortOrder: string
  ) {
    const result = await pool.query(getProfessorsByUniversityIdPaginated, [
      limit,
      offset,
      universityId,
      search,
      sortBy,
      sortOrder,
    ]);
    return result.rows as Professor[];
  }

  async getProfessorsByUniversityIdCount(universityId: string, search: string | null) {
    const result = await pool.query(getProfessorsByUniversityIdCount, [universityId, search]);
    return parseInt(result.rows[0].count, 10);
  }

  async getProfessorsByCourseId(courseId: string) {
    const result = await pool.query(getProfessorsByCourseID, [courseId]);
    return result.rows as Professor[];
  }
}
