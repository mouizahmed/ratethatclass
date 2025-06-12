import { ReportRepository } from '../repositories/reportRepository';
import { Report, ReportStatus, ValidReportEntityType, VALID_REPORT_ENTITY_TYPES } from '../types';

export class ReportService {
  private reportRepository: ReportRepository;

  constructor() {
    this.reportRepository = new ReportRepository();
  }

  async createReport(
    userId: string,
    reportDetails: { entity_type: ValidReportEntityType; entity_id: string; report_reason: string }
  ): Promise<{ report_id: string }> {
    // Validate entity type
    if (!reportDetails.entity_type || !VALID_REPORT_ENTITY_TYPES.includes(reportDetails.entity_type)) {
      throw {
        status: 400,
        message: `Invalid entity_type. Must be one of: ${VALID_REPORT_ENTITY_TYPES.join(', ')}`,
      };
    }

    // Validate report reason
    if (!reportDetails.report_reason || reportDetails.report_reason.trim().length === 0) {
      throw {
        status: 400,
        message: 'Report reason is required',
      };
    }

    if (reportDetails.report_reason.trim().length > 1000) {
      throw {
        status: 400,
        message: 'Report reason must be less than 1000 characters',
      };
    }

    // Validate entity exists
    const entityExists = await this.reportRepository.validateEntityExists(
      reportDetails.entity_type,
      reportDetails.entity_id
    );
    if (!entityExists) {
      throw {
        status: 404,
        message: `${reportDetails.entity_type.charAt(0).toUpperCase() + reportDetails.entity_type.slice(1)} not found`,
      };
    }

    return this.reportRepository.createReport(
      userId,
      reportDetails.entity_type,
      reportDetails.entity_id,
      reportDetails.report_reason
    );
  }

  async getReports(
    page: number,
    limit: number,
    entityType: ValidReportEntityType,
    status: ReportStatus | null,
    sortBy: string,
    sortOrder: string
  ): Promise<{
    data: Report[];
    meta: { current_page: number; page_size: number; total_items: number; total_pages: number };
  }> {
    const { reports, total } = await this.reportRepository.getReports(
      page,
      limit,
      entityType,
      status,
      sortBy,
      sortOrder
    );
    const totalPages = Math.ceil(total / limit);

    return {
      data: reports,
      meta: {
        current_page: page,
        page_size: limit,
        total_items: total,
        total_pages: totalPages,
      },
    };
  }
}
