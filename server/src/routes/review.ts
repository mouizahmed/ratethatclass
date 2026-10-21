import express from 'express';
import { ReviewController } from '../controllers/reviewController';
import { ReviewService } from '../services/reviewService';
import { validateToken, validateTokenGet, validateTokenOptional } from '../middleware/Auth';
import { paginationMiddleware } from '../middleware/pagination';
import { contentLimiter, ipWriteLimiter, voteLimiter } from '../middleware/rateLimit';

const router = express.Router();

// Initialize dependencies
const reviewService = new ReviewService();
const reviewController = new ReviewController(reviewService);

// Routes
router.get('/', paginationMiddleware(), reviewController.getReviews.bind(reviewController));
router.get('/votes', validateTokenGet, reviewController.getVotes.bind(reviewController));
router.get('/owned', validateTokenGet, reviewController.getOwnedReviewIds.bind(reviewController));
router.get(
  '/by-course-id/:courseId',
  validateTokenOptional,
  paginationMiddleware(),
  reviewController.getReviewsByCourseId.bind(reviewController)
);
router.post('/vote', ipWriteLimiter, validateToken, voteLimiter, reviewController.vote.bind(reviewController));
router.post('/', ipWriteLimiter, validateToken, contentLimiter, reviewController.addReview.bind(reviewController));
router.delete('/:reviewId', validateToken, reviewController.deleteReview.bind(reviewController));

export default router;
