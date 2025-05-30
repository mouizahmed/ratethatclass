import express, { Response } from 'express';
import {
  addUser,
  getUserReviewsPaginated,
  getUserReviewsCount,
  getUserVotedReviewsPaginated,
  getUserVotedReviewsCount,
} from '../db/queries';
import { pool } from '../db/db';
import { AuthenticatedRequest, Review } from 'types';
import { validateToken } from '../../middleware/Auth';
import { auth } from '../../firebase/firebase';

const router = express.Router();

router.post('/register', async (req: AuthenticatedRequest, res: Response) => {
  const { display_name, email, password } = req.body;

  try {
    const newUser = await auth.createUser({
      email: email.trim(),
      emailVerified: false,
      password: password,
      displayName: display_name.trim(),
    });
    await pool.query(addUser, [newUser.uid, display_name.trim(), email.trim()]);
    const token = await auth.createCustomToken(newUser.uid);

    res.json({
      success: true,
      message: 'User registered successfully',
      data: { token: token },
      meta: {},
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: {},
      meta: {},
    });
  }
});

router.get('/reviews', validateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { uid } = req.user;

  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 10);
  const offset = (page - 1) * limit;
  const sortBy = (req.query.sort_by as string) || 'date_uploaded';
  const sortOrder = (req.query.sort_order as string) || 'desc';

  try {
    const countResult = await pool.query(getUserReviewsCount, [uid]);
    const totalItems = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / limit);

    const result = await pool.query(getUserReviewsPaginated, [uid, sortBy, sortOrder.toUpperCase(), limit, offset]);

    res.json({
      success: true,
      message: 'User reviews fetched successfully',
      data: result.rows as Review[],
      meta: {
        current_page: page,
        page_size: limit,
        total_items: totalItems,
        total_pages: totalPages,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: [],
      meta: {},
    });
  }
});

router.get('/upvotes', validateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { uid } = req.user;

  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 10);
  const offset = (page - 1) * limit;
  const sortBy = (req.query.sort_by as string) || 'date_uploaded';
  const sortOrder = (req.query.sort_order as string) || 'desc';

  try {
    const countResult = await pool.query(getUserVotedReviewsCount, [uid, 'up']);
    const totalItems = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / limit);

    const result = await pool.query(getUserVotedReviewsPaginated, [
      uid,
      'up',
      sortBy,
      sortOrder.toUpperCase(),
      limit,
      offset,
    ]);

    res.json({
      success: true,
      message: 'User upvoted reviews fetched successfully',
      data: result.rows as Review[],
      meta: {
        current_page: page,
        page_size: limit,
        total_items: totalItems,
        total_pages: totalPages,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: [],
      meta: {},
    });
  }
});

router.get('/downvotes', validateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { uid } = req.user;

  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 10);
  const offset = (page - 1) * limit;
  const sortBy = (req.query.sort_by as string) || 'date_uploaded';
  const sortOrder = (req.query.sort_order as string) || 'desc';

  try {
    const countResult = await pool.query(getUserVotedReviewsCount, [uid, 'down']);
    const totalItems = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / limit);

    const result = await pool.query(getUserVotedReviewsPaginated, [
      uid,
      'down',
      sortBy,
      sortOrder.toUpperCase(),
      limit,
      offset,
    ]);

    res.json({
      success: true,
      message: 'User downvoted reviews fetched successfully',
      data: result.rows as Review[],
      meta: {
        current_page: page,
        page_size: limit,
        total_items: totalItems,
        total_pages: totalPages,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: [],
      meta: {},
    });
  }
});

router.delete('/delete/reviewID/:review_id', validateToken, async (req: AuthenticatedRequest, res: Response) => {});

export default router;
