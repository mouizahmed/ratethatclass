import { Response } from 'express';
import { UserService } from '../services/userService';
import { AuthenticatedRequest } from '../types';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
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

  async registerUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { display_name, email, password } = req.body;

      const result = await this.userService.registerUser(display_name, email, password);
      this.sendSuccessResponse(res, result, 'User registered successfully');
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }

  async getUserReviews(req: AuthenticatedRequest, res: Response) {
    try {
      const { uid } = req.user;
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 10);
      const sortBy = (req.query.sort_by as string) || 'date_uploaded';
      const sortOrder = (req.query.sort_order as string) || 'desc';

      const result = await this.userService.getUserReviews(uid, page, limit, sortBy, sortOrder);
      this.sendSuccessResponse(res, result, 'User reviews fetched successfully');
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }

  async getUserUpvotedReviews(req: AuthenticatedRequest, res: Response) {
    try {
      const { uid } = req.user;
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 10);
      const sortBy = (req.query.sort_by as string) || 'date_uploaded';
      const sortOrder = (req.query.sort_order as string) || 'desc';

      const result = await this.userService.getUserVotedReviews(uid, 'up', page, limit, sortBy, sortOrder);
      this.sendSuccessResponse(res, result, 'User upvoted reviews fetched successfully');
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }

  async getUserDownvotedReviews(req: AuthenticatedRequest, res: Response) {
    try {
      const { uid } = req.user;
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 10);
      const sortBy = (req.query.sort_by as string) || 'date_uploaded';
      const sortOrder = (req.query.sort_order as string) || 'desc';

      const result = await this.userService.getUserVotedReviews(uid, 'down', page, limit, sortBy, sortOrder);
      this.sendSuccessResponse(res, result, 'User downvoted reviews fetched successfully');
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }
}
