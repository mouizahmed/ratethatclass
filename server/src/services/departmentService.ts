import { pool } from '../db/db';
import {
  getDepartmentsPaginated,
  getDepartmentsCount,
  getDepartmentByUniversityId,
  getDepartmentById,
  addDepartment,
} from '../db/queries';
import { Department } from '../types';

export class DepartmentService {
  async getDepartmentsPaginated(page: number, limit: number, search: string | null, sortBy: string, sortOrder: string) {
    const offset = (page - 1) * limit;
    const result = await pool.query(getDepartmentsPaginated, [limit, offset, search, sortBy, sortOrder]);
    const countResult = await pool.query(getDepartmentsCount, [search]);

    const totalItems = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: result.rows as Department[],
      meta: {
        current_page: page,
        page_size: limit,
        total_items: totalItems,
        total_pages: totalPages,
      },
    };
  }

  async getDepartmentsByUniversityId(universityId: string, search: string | null, sortBy: string, sortOrder: string) {
    const result = await pool.query(getDepartmentByUniversityId, [universityId, search, sortBy, sortOrder]);
    return {
      data: result.rows as Department[],
      meta: {
        total_items: result.rows.length,
      },
    };
  }

  async getDepartmentById(id: string) {
    const result = await pool.query(getDepartmentById, [id]);
    if (result.rows.length === 0) {
      throw new Error('Department not found');
    }
    return {
      data: result.rows[0] as Department,
      meta: {},
    };
  }

  async addDepartment(departmentName: string, universityId: string) {
    await pool.query(addDepartment, [departmentName.trim(), universityId]);
    return {
      data: { department_name: departmentName, university_id: universityId },
      meta: {},
    };
  }
}
