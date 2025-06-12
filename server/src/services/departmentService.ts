import { DepartmentRepository } from '../repositories/departmentRepository';
import { Department } from '../types';

export class DepartmentService {
  private departmentRepository: DepartmentRepository;

  constructor() {
    this.departmentRepository = new DepartmentRepository();
  }

  async getDepartmentsPaginated(page: number, limit: number, search: string | null, sortBy: string, sortOrder: string) {
    const offset = (page - 1) * limit;
    const departments = await this.departmentRepository.getDepartmentsPaginated(
      limit,
      offset,
      search,
      sortBy,
      sortOrder
    );
    const totalItems = await this.departmentRepository.getDepartmentsCount(search);
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: departments,
      meta: {
        current_page: page,
        page_size: limit,
        total_items: totalItems,
        total_pages: totalPages,
      },
    };
  }

  async getDepartmentsByUniversityId(universityId: string, search: string | null, sortBy: string, sortOrder: string) {
    const departments = await this.departmentRepository.getDepartmentsByUniversityId(
      universityId,
      search,
      sortBy,
      sortOrder
    );
    return {
      data: departments,
      meta: {
        total_items: departments.length,
      },
    };
  }

  async getDepartmentById(id: string) {
    const department = await this.departmentRepository.getDepartmentById(id);
    if (!department) {
      throw new Error('Department not found');
    }
    return {
      data: department,
      meta: {},
    };
  }

  async addDepartment(departmentName: string, universityId: string) {
    await this.departmentRepository.addDepartment(departmentName, universityId);
    return {
      data: { department_name: departmentName, university_id: universityId },
      meta: {},
    };
  }
}
