import { Request, Response } from 'express';
import { UniversityService } from '../services/universityService';
import { validateUUID } from '../helpers';
import { InputValidator } from '../validators/inputValidator';
import crypto from 'crypto';

export class UniversityController {
  constructor(private universityService: UniversityService) {}

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

  async getUniversities(req: Request, res: Response) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 20);
      const search = (req.query.search as string) || null;
      const sortBy = (req.query.sort_by as string) || 'review_num';
      const sortOrder = (req.query.sort_order as string) || 'desc';

      const result = await this.universityService.getUniversities(page, limit, search, sortBy, sortOrder);
      this.sendSuccessResponse(res, result, 'Universities fetched successfully');
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }

  async getUniversityByName(req: Request, res: Response) {
    try {
      const universityName = req.params.name.replace(/_/g, ' ');
      const university = await this.universityService.getUniversityByName(universityName);
      this.sendSuccessResponse(res, university, 'University fetched successfully');
    } catch (error) {
      this.sendErrorResponse(res, error, error.message === 'University not found' ? 404 : 500);
    }
  }

  async getUniversityById(req: Request, res: Response) {
    try {
      const universityId = req.params.id;
      validateUUID(universityId);
      const university = await this.universityService.getUniversityById(universityId);
      this.sendSuccessResponse(res, university, 'University fetched successfully');
    } catch (error) {
      this.sendErrorResponse(res, error, error.message === 'University not found' ? 404 : 500);
    }
  }

  async getUniversityDomains(req: Request, res: Response) {
    try {
      const domains = await this.universityService.getUniversityDomains();
      this.sendSuccessResponse(res, domains, 'University domains fetched successfully');
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }

  async getRequestedUniversities(req: Request, res: Response) {
    try {
      let token = req.cookies.token;
      if (!token) {
        token = crypto.randomBytes(16).toString('hex');
        res.cookie('token', token, {
          maxAge: 60 * 60 * 24 * 365 * 1000,
          httpOnly: true,
        });
      }

      const universities = await this.universityService.getRequestedUniversities(token);
      this.sendSuccessResponse(res, universities, 'Requested universities fetched successfully');
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }

  async upvoteRequestedUniversity(req: Request, res: Response) {
    try {
      const universityId = req.params.id;
      validateUUID(universityId);

      let token = req.cookies.token;
      if (!token) {
        token = crypto.randomBytes(16).toString('hex');
        res.cookie('token', token, {
          maxAge: 60 * 60 * 24 * 365 * 1000,
          httpOnly: true,
        });
      }

      const result = await this.universityService.upvoteRequestedUniversity(universityId, token);
      this.sendSuccessResponse(res, result, 'University successfully upvoted');
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }

  async requestUniversity(req: Request, res: Response) {
    try {
      const { name }: { name: string } = req.body;

      InputValidator.validateUniversityRequest(name);

      const result = await this.universityService.requestUniversity(name);
      this.sendSuccessResponse(res, { university_name: name }, 'University request successfully added');
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }
}
