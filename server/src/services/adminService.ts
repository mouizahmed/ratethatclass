import { AdminRepository } from '../repositories/adminRepository';
import { auth } from '../../firebase/firebase';

export class AdminService {
  private adminRepository: AdminRepository;

  constructor() {
    this.adminRepository = new AdminRepository();
  }

  async deleteReviewAndResolveReport(reportId: string): Promise<void> {
    const report = await this.adminRepository.getReportById(reportId);
    if (report.entity_type !== 'review') {
      throw new Error('Invalid entity type for review deletion');
    }
    await this.adminRepository.deleteReviewAndResolveReport(reportId, report.entity_id);
  }

  async deleteProfessorAndResolveReport(reportId: string): Promise<void> {
    const report = await this.adminRepository.getReportById(reportId);
    if (report.entity_type !== 'review') {
      throw new Error('Invalid entity type for professor deletion');
    }
    const reviewRes = await this.adminRepository.getReportById(reportId);
    if (!reviewRes) {
      throw new Error('Review not found');
    }
    const professorId = reviewRes.entity_id;
    await this.adminRepository.deleteProfessorAndResolveReport(reportId, professorId);
  }

  async deleteDepartmentAndResolveReport(reportId: string): Promise<void> {
    const report = await this.adminRepository.getReportById(reportId);
    let departmentId = null;
    if (report.entity_type === 'review') {
      const reviewRes = await this.adminRepository.getReportById(reportId);
      if (!reviewRes) {
        throw new Error('Review not found');
      }
      departmentId = reviewRes.entity_id;
    } else if (report.entity_type === 'course') {
      const courseRes = await this.adminRepository.getReportById(reportId);
      if (!courseRes) {
        throw new Error('Course not found');
      }
      departmentId = courseRes.entity_id;
    } else {
      throw new Error('Invalid entity type for department removal');
    }
    await this.adminRepository.deleteDepartmentAndResolveReport(reportId, departmentId);
  }

  async deleteCourseAndResolveReport(reportId: string): Promise<void> {
    const report = await this.adminRepository.getReportById(reportId);
    let courseId = null;
    if (report.entity_type === 'review') {
      const reviewRes = await this.adminRepository.getReportById(reportId);
      if (!reviewRes) {
        throw new Error('Review not found');
      }
      courseId = reviewRes.entity_id;
    } else if (report.entity_type === 'course') {
      courseId = report.entity_id;
    } else {
      throw new Error('Invalid entity type for course removal');
    }
    await this.adminRepository.deleteCourseAndResolveReport(reportId, courseId);
  }

  async banUser(userId: string, banReason: string, adminId: string): Promise<void> {
    await this.adminRepository.banUser(userId, banReason, adminId);
    await auth.setCustomUserClaims(userId, { banned: true, ban_reason: banReason });
  }

  async getBannedUsers(page: number, limit: number): Promise<{ users: any[]; total: number; totalPages: number }> {
    const { users, total } = await this.adminRepository.getBannedUsers(page, limit);
    const totalPages = Math.ceil(total / limit);
    return { users, total, totalPages };
  }

  async dismissReport(reportId: string): Promise<void> {
    await this.adminRepository.dismissReport(reportId);
  }

  async unbanUser(userId: string): Promise<void> {
    await this.adminRepository.unbanUser(userId);
    await auth.setCustomUserClaims(userId, { banned: false, ban_reason: null });
  }
}
