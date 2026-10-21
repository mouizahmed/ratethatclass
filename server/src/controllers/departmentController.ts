import { Request, Response } from 'express';
import { DepartmentService } from '../services/departmentService';
import { validateUUID } from '../helpers';

export class DepartmentController {
  private departmentService: DepartmentService;

  constructor() {
    this.departmentService = new DepartmentService();
  }

  private sendSuccessResponse(res: Response, result: any, message: string) {
    res.json({
      success: true,
      message,
      data: result.data,
      meta: result.meta,
    });
  }

  private sendErrorResponse(res: Response, error: any) {
    console.log(error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
      data: {},
      meta: {},
    });
  }

  async getDepartments(req: Request, res: Response) {
    try {
      const { page, limit, sortBy, sortOrder } = req.pagination;
      const search = (req.query.search as string) || null;

      const result = await this.departmentService.getDepartmentsPaginated(page, limit, search, sortBy, sortOrder);
      this.sendSuccessResponse(res, result, 'Departments fetched successfully');
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }

  async getDepartmentsByUniversityId(req: Request, res: Response) {
    try {
      const { universityId } = req.params;
      const search = (req.query.search as string) || null;
      const sortBy = (req.query.sort_by as string) || 'total_reviews';
      const sortOrder = (req.query.sort_order as string) || 'desc';

      validateUUID(universityId);
      const result = await this.departmentService.getDepartmentsByUniversityId(universityId, search, sortBy, sortOrder);
      this.sendSuccessResponse(res, result, 'Departments fetched successfully');
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }

  async getDepartmentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      validateUUID(id);

      const result = await this.departmentService.getDepartmentById(id);
      this.sendSuccessResponse(res, result, 'Department fetched successfully');
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }
}
