import { University, RequestedUniversity } from '../types';
import { UniversityRepository } from '../repositories/universityRepository';

export class UniversityService {
  constructor(private universityRepository: UniversityRepository) {}

  async getUniversities(page: number, limit: number, search: string | null, sortBy: string, sortOrder: string) {
    const offset = (page - 1) * limit;
    const [universities, totalItems] = await Promise.all([
      this.universityRepository.getUniversitiesPaginated(limit, offset, search, sortBy, sortOrder),
      this.universityRepository.getUniversitiesCount(search),
    ]);

    return {
      data: universities,
      meta: {
        current_page: page,
        page_size: limit,
        total_items: totalItems,
        total_pages: Math.ceil(totalItems / limit),
      },
    };
  }

  async getUniversityByName(name: string) {
    const university = await this.universityRepository.getUniversityByName(name);
    if (!university) {
      throw new Error('University not found');
    }
    return university;
  }

  async getUniversityById(id: string) {
    const university = await this.universityRepository.getUniversityById(id);
    if (!university) {
      throw new Error('University not found');
    }
    return university;
  }

  async getUniversityDomains() {
    return this.universityRepository.getUniversityDomains();
  }

  async getRequestedUniversities(token: string) {
    return this.universityRepository.getRequestedUniversities(token);
  }

  async requestUniversity(name: string) {
    return this.universityRepository.requestUniversity(name);
  }

  async upvoteRequestedUniversity(universityId: string, token: string) {
    await this.universityRepository.upvoteRequestedUniversity(universityId, token);
    return { university_id: universityId, user_token: token };
  }
}
