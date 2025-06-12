import { ProfessorRepository } from '../repositories/professorRepository';
import { Professor } from '../types';

export class ProfessorService {
  private professorRepository: ProfessorRepository;

  constructor() {
    this.professorRepository = new ProfessorRepository();
  }

  async getProfessorsPaginated(page: number, limit: number, search: string | null, sortBy: string, sortOrder: string) {
    const offset = (page - 1) * limit;
    const professors = await this.professorRepository.getProfessorsPaginated(limit, offset, search, sortBy, sortOrder);
    const totalItems = await this.professorRepository.getProfessorsCount(search);
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: professors,
      meta: {
        current_page: page,
        page_size: limit,
        total_items: totalItems,
        total_pages: totalPages,
      },
    };
  }

  async getProfessorsByUniversityId(
    universityId: string,
    page: number,
    limit: number,
    search: string | null,
    sortBy: string,
    sortOrder: string
  ) {
    const offset = (page - 1) * limit;
    const professors = await this.professorRepository.getProfessorsByUniversityId(
      limit,
      offset,
      universityId,
      search,
      sortBy,
      sortOrder
    );
    const totalItems = await this.professorRepository.getProfessorsByUniversityIdCount(universityId, search);
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: professors,
      meta: {
        current_page: page,
        page_size: limit,
        total_items: totalItems,
        total_pages: totalPages,
      },
    };
  }

  async getProfessorsByCourseId(courseId: string) {
    const professors = await this.professorRepository.getProfessorsByCourseId(courseId);
    return {
      data: professors,
      meta: {
        total_items: professors.length,
      },
    };
  }
}
