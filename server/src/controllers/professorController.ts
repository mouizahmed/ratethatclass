import { Request, Response } from 'express';
import { ProfessorService } from '../services/professorService';
import { validateUUID } from '../helpers';

export class ProfessorController {
  private professorService: ProfessorService;

  constructor() {
    this.professorService = new ProfessorService();
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

  async getProfessors(req: Request, res: Response) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 20);
      const search = (req.query.search as string) || null;
      const sortBy = (req.query.sort_by as string) || 'professor_name';
      const sortOrder = (req.query.sort_order as string) || 'asc';

      const result = await this.professorService.getProfessorsPaginated(page, limit, search, sortBy, sortOrder);
      this.sendSuccessResponse(res, result, 'Professors fetched successfully');
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }

  async getProfessorsByUniversityId(req: Request, res: Response) {
    try {
      const { universityId } = req.params;
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 20);
      const search = (req.query.search as string) || null;
      const sortBy = (req.query.sort_by as string) || 'professor_name';
      const sortOrder = (req.query.sort_order as string) || 'asc';

      validateUUID(universityId);
      const result = await this.professorService.getProfessorsByUniversityId(
        universityId,
        page,
        limit,
        search,
        sortBy,
        sortOrder
      );
      this.sendSuccessResponse(res, result, 'Professors fetched successfully');
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }

  async getProfessorsByCourseId(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      validateUUID(courseId);

      const result = await this.professorService.getProfessorsByCourseId(courseId);
      this.sendSuccessResponse(res, result, 'Professors fetched successfully');
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }
}
