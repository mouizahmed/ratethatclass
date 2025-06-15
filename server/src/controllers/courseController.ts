import { Request, Response } from 'express';
import { CourseService } from '../services/courseService';
import { AuthenticatedRequest } from '../types';
import { validateUUID } from '../helpers';

export class CourseController {
  constructor(private courseService: CourseService) {}

  private sendSuccessResponse(res: Response, data: any, message: string = 'Success') {
    res.json({
      success: true,
      message,
      data: data.data || data,
      meta: data.meta || {},
    });
  }

  private sendErrorResponse(res: Response, error: Error, status: number = 500) {
    res.status(status).json({
      success: false,
      message: error.message,
      data: {},
      meta: {},
    });
  }

  async getCourses(req: Request, res: Response) {
    try {
      const { page, limit, sortBy, sortOrder } = req.pagination;
      const search = (req.query.search as string) || null;

      const result = await this.courseService.getCourses(page, limit, search, sortBy, sortOrder);
      this.sendSuccessResponse(res, result, 'Courses fetched successfully');
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }

  async getCoursesByUniversityId(req: Request, res: Response) {
    try {
      const { universityId } = req.params;
      const { page, limit, sortBy, sortOrder } = req.pagination;
      const search = (req.query.search as string) || null;
      const departmentId = (req.query.department_id as string) || null;

      const result = await this.courseService.getCoursesByUniversityId(
        universityId,
        page,
        limit,
        search,
        departmentId,
        sortBy,
        sortOrder
      );
      this.sendSuccessResponse(res, result, 'Courses fetched successfully');
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }

  async getCoursesByDepartmentId(req: Request, res: Response) {
    try {
      const { departmentId } = req.params;
      validateUUID(departmentId);

      const result = await this.courseService.getCoursesByDepartmentId(departmentId);
      this.sendSuccessResponse(res, result, 'Courses fetched successfully');
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }

  async getCourseById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      validateUUID(id);

      const course = await this.courseService.getCourseById(id);
      this.sendSuccessResponse(res, course, 'Course fetched successfully');
    } catch (error) {
      this.sendErrorResponse(res, error, error.message === 'Course not found' ? 404 : 500);
    }
  }

  async getCourseByTag(req: Request, res: Response) {
    try {
      const { universityId, courseTag } = req.params;
      validateUUID(universityId);

      const decodedCourseTag = courseTag.replace(/(?<=\w)-(?=\w)/g, '/').replace(/_/g, ' ');

      const course = await this.courseService.getCourseByTag(decodedCourseTag, universityId);
      this.sendSuccessResponse(res, course, 'Course fetched successfully');
    } catch (error) {
      this.sendErrorResponse(res, error, error.message === 'Course not found' ? 404 : 500);
    }
  }

  async addCourseWithReview(req: AuthenticatedRequest, res: Response) {
    try {
      const { course, review } = req.body.data;
      const userId = req.user!.user_id;

      const result = await this.courseService.addCourseWithReview(course, review, userId);
      this.sendSuccessResponse(res, result, 'Course and review added successfully');
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }
}
