import express from 'express';
import { UserController } from '../controllers/userController';
import { validateToken } from '../../middleware/Auth';

const router = express.Router();
const userController = new UserController();

// Public routes
router.post('/register', userController.registerUser.bind(userController));

// Protected routes
router.get('/reviews', validateToken, userController.getUserReviews.bind(userController));
router.get('/upvoted-reviews', validateToken, userController.getUserUpvotedReviews.bind(userController));
router.get('/downvoted-reviews', validateToken, userController.getUserDownvotedReviews.bind(userController));

export default router;
