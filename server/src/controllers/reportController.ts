import { Response } from 'express';
import { ReportService } from '../services/reportService';
import { AuthenticatedRequest, ReportStatus, ValidReportEntityType } from '../types';

export class ReportController {
  private reportService: ReportService;

  constructor() {
    this.reportService = new ReportService();
  }

  private sendSuccessResponse(res: Response, result: { data: any; meta: any }, message: string) {
    res.json({
      success: true,
      message,
      data: result.data,
      meta: result.meta,
    });
  }

  private sendErrorResponse(res: Response, error: { status?: number; message: string }) {
    console.log(error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
      data: {},
      meta: {},
    });
  }

  async getReports(req: AuthenticatedRequest, res: Response) {
    try {
      const { page, limit, sortBy, sortOrder } = req.pagination;
      const entityType = req.query.entity_type as ValidReportEntityType;
      const status = req.query.status as ReportStatus;

      if (!entityType) {
        throw {
          status: 400,
          message: 'entity_type query parameter is required',
        };
      }

      const result = await this.reportService.getReports(page, limit, entityType, status, sortBy, sortOrder);
      this.sendSuccessResponse(res, result, 'Reports fetched successfully');
    } catch (error) {
      this.sendErrorResponse(res, error as { status?: number; message: string });
    }
  }

  async createReport(req: AuthenticatedRequest, res: Response) {
    try {
      const { reportDetails } = req.body;
      const { uid } = req.user;

      const result = await this.reportService.createReport(uid, reportDetails);
      this.sendSuccessResponse(res, { data: result, meta: {} }, 'Report created successfully');
    } catch (error) {
      this.sendErrorResponse(res, error as { status?: number; message: string });
    }
  }
}
