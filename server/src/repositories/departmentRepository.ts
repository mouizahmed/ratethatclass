import { pool } from '../db/db';
import {
  getDepartmentsPaginated,
  getDepartmentsCount,
  getDepartmentByUniversityId,
  getDepartmentById,
  addDepartment,
} from '../db/queries';
import { Department } from '../types';

export class DepartmentRepository {
  async getDepartmentsPaginated(
    limit: number,
    offset: number,
    search: string | null,
    sortBy: string,
    sortOrder: string
  ) {
    const result = await pool.query(getDepartmentsPaginated, [limit, offset, search, sortBy, sortOrder]);
    return result.rows as Department[];
  }

  async getDepartmentsCount(search: string | null) {
    const result = await pool.query(getDepartmentsCount, [search]);
    return parseInt(result.rows[0].count, 10);
  }

  async getDepartmentsByUniversityId(universityId: string, search: string | null, sortBy: string, sortOrder: string) {
    const result = await pool.query(getDepartmentByUniversityId, [universityId, search, sortBy, sortOrder]);
    return result.rows as Department[];
  }

  async getDepartmentById(id: string) {
    const result = await pool.query(getDepartmentById, [id]);
    return result.rows[0] as Department;
  }

  async addDepartment(departmentName: string, universityId: string) {
    await pool.query(addDepartment, [departmentName.trim(), universityId]);
  }
}
