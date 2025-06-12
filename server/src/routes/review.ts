import express from 'express';
import { ReviewController } from '../controllers/reviewController';
import { ReviewService } from '../services/reviewService';
import { validateToken, validateTokenOptional } from '../../middleware/Auth';
import { paginationMiddleware } from '../../middleware/pagination';

const router = express.Router();

// Initialize dependencies
const reviewService = new ReviewService();
const reviewController = new ReviewController(reviewService);

// Routes
router.get('/', paginationMiddleware(), reviewController.getReviews.bind(reviewController));
router.get('/votes', validateToken, reviewController.getVotes.bind(reviewController));
router.get(
  '/by-course-id/:courseId',
  validateTokenOptional,
  paginationMiddleware(),
  reviewController.getReviewsByCourseId.bind(reviewController)
);
router.post('/vote', validateToken, reviewController.vote.bind(reviewController));
router.post('/', validateToken, reviewController.addReview.bind(reviewController));
router.delete('/:reviewId', validateToken, reviewController.deleteReview.bind(reviewController));

export default router;
