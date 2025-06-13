import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { validateUUID } from '../helpers';
import { ReviewService } from 'services/reviewService';

export class ReviewController {
  constructor(private reviewService: ReviewService) {}

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

  async getReviews(req: Request, res: Response) {
    try {
      const { page, limit, sortBy, sortOrder } = req.pagination;
      const search = (req.query.search as string) || null;

      const result = await this.reviewService.getReviews(page, limit, search, sortBy, sortOrder);
      this.sendSuccessResponse(res, result, 'Reviews fetched successfully');
    } catch (error) {
      this.sendErrorResponse(res, error, error.message === 'review_ids must be provided' ? 400 : 500);
    }
  }

  async getVotes(req: AuthenticatedRequest, res: Response) {
    try {
      const review_ids = req.query.review_ids as string;
      if (!review_ids) {
        throw new Error('review_ids must be provided');
      }

      const result = await this.reviewService.getVotes(req.user.uid, review_ids.split(','));
      this.sendSuccessResponse(res, result, 'Vote states fetched successfully');
    } catch (error) {
      this.sendErrorResponse(res, error, error.message === 'review_ids must be provided' ? 400 : 500);
    }
  }

  async getReviewsByCourseId(req: AuthenticatedRequest, res: Response) {
    try {
      const { courseId } = req.params;
      validateUUID(courseId);

      const { page, limit, sortBy, sortOrder } = req.pagination;
      const professorID = (req.query.professor_id as string) || null;
      const term = (req.query.term as string) || null;
      const deliveryMethod = (req.query.delivery_method as string) || null;

      const result = await this.reviewService.getReviewsByCourseId(
        courseId,
        req.user?.uid || '',
        page,
        limit,
        professorID,
        term,
        deliveryMethod,
        sortBy,
        sortOrder
      );
      this.sendSuccessResponse(res, result, 'Reviews fetched successfully');
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }

  async vote(req: AuthenticatedRequest, res: Response) {
    try {
      const { review_id, vote_type } = req.body.data;
      if (!review_id || !vote_type) {
        throw new Error('review_id and vote_type must be provided');
      }
      if (!['up', 'down'].includes(vote_type)) {
        throw new Error('vote_type must be either "up" or "down"');
      }

      const result = await this.reviewService.vote(req.user.uid, review_id, vote_type);
      this.sendSuccessResponse(res, result, `Review successfully ${vote_type}voted`);
    } catch (error) {
      this.sendErrorResponse(res, error, error.message.includes('must be provided') ? 400 : 500);
    }
  }

  async addReview(req: AuthenticatedRequest, res: Response) {
    try {
      const { data: review } = req.body;
      const result = await this.reviewService.addReview(review, req.user.uid);
      this.sendSuccessResponse(res, result, 'Review successfully added');
    } catch (error) {
      this.sendErrorResponse(res, error, error.message.includes('validation') ? 400 : 500);
    }
  }

  async deleteReview(req: AuthenticatedRequest, res: Response) {
    try {
      const { reviewId } = req.params;
      validateUUID(reviewId);

      const result = await this.reviewService.deleteReview(reviewId, req.user.uid);
      this.sendSuccessResponse(res, result, 'Review successfully deleted');
    } catch (error) {
      this.sendErrorResponse(res, error, error.message === 'Review not found' ? 404 : 500);
    }
  }
}
