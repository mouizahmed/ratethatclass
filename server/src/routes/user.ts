import express from 'express';
import { UserController } from '../controllers/userController';
import { validateTokenGet } from '../middleware/Auth';
import { registerLimiter } from '../middleware/rateLimit';

const router = express.Router();
const userController = new UserController();

// Public routes
router.post('/register', registerLimiter, userController.registerUser.bind(userController));

// Protected routes
router.get('/reviews', validateTokenGet, userController.getUserReviews.bind(userController));
router.get('/upvoted-reviews', validateTokenGet, userController.getUserUpvotedReviews.bind(userController));
router.get('/downvoted-reviews', validateTokenGet, userController.getUserDownvotedReviews.bind(userController));

export default router;
