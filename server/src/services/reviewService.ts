import { Review } from '../types';
import { ReviewRepository } from '../repositories/reviewRepository';
import { InputValidator } from '../validators/inputValidator';

export class ReviewService {
  private reviewRepository: ReviewRepository;

  constructor() {
    this.reviewRepository = new ReviewRepository();
  }

  async getReviews(page: number, limit: number, search: string | null, sortBy: string, sortOrder: string) {
    return this.reviewRepository.getReviewsPaginated(page, limit, search, sortBy, sortOrder);
  }

  async getVotes(userId: string, reviewIds: string[]) {
    return this.reviewRepository.getUserVotes(userId, reviewIds);
  }

  async getReviewsByCourseId(
    courseId: string,
    userId: string,
    page: number,
    limit: number,
    professorID: string | null,
    term: string | null,
    deliveryMethod: string | null,
    sortBy: string,
    sortOrder: string
  ) {
    return this.reviewRepository.getReviewsByCourseId(
      courseId,
      userId,
      page,
      limit,
      professorID,
      term,
      deliveryMethod,
      sortBy,
      sortOrder
    );
  }

  async vote(userId: string, reviewId: string, voteType: 'up' | 'down') {
    return this.reviewRepository.handleVote(userId, reviewId, voteType);
  }

  async addReview(reviewData: Review, userId: string) {
    // Validate review data
    InputValidator.validateReview(reviewData);
    return this.reviewRepository.createReview(reviewData, userId);
  }

  async deleteReview(reviewId: string, userId: string) {
    return this.reviewRepository.removeReview(reviewId, userId);
  }
}
