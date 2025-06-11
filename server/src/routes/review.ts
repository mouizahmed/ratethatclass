import express, { Request, Response } from 'express';
import {
  getReviewsPaginated,
  getReviewsCount,
  getReviewsByCourseIDPaginated,
  getReviewsByCourseIDWithProfessor,
  getReviewsByCourseIDWithTerm,
  getReviewsByCourseIDWithDelivery,
  getExistingVote,
  addVote,
  deleteVote,
  updateVote,
  updateTotalVotes,
  addReview,
  getProfessorID,
  addProfessor,
  addUpvote,
  deleteUserReview,
} from '../db/queries';
import { pool } from '../db/db';
import { AuthenticatedRequest, Review } from 'types';
import { validateToken, validateTokenOptional } from '../../middleware/Auth';
import { PoolClient } from 'pg';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 20);
  const offset = (page - 1) * limit;
  const search = (req.query.search as string) || null;
  const sortBy = (req.query.sort_by as string) || 'date_uploaded';
  const sortOrder = (req.query.sort_order as string) || 'desc';

  try {
    const queryText = `${getReviewsPaginated} ORDER BY reviews.${sortBy} ${
      sortOrder === 'asc' ? 'ASC' : 'DESC'
    } LIMIT $1 OFFSET $2`;
    const result = await pool.query(queryText, [limit, offset, search]);

    const countResult = await pool.query(getReviewsCount, [search]);

    const totalItems = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      message: 'Reviews fetched successfully',
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
      data: {},
      meta: {},
    });
  }
});

router.get('/votes', validateToken, async (req: AuthenticatedRequest, res: Response) => {
  const review_ids = req.query.review_ids as string;
  const user = req.user;

  try {
    const result = await pool.query(
      `
      SELECT * 
      FROM user_votes 
      WHERE user_id = $1 AND review_id = ANY($2::uuid[])
    `,
      [user.uid, review_ids.split(',')]
    );

    res.json({
      success: true,
      message: 'Vote states fetched successfully',
      data: result.rows,
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

router.get('/by-course-id/:courseId', validateTokenOptional, async (req: AuthenticatedRequest, res: Response) => {
  const { courseId } = req.params;
  const user = req.user;

  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 20);
  const offset = (page - 1) * limit;
  const professorID = (req.query.professor_id as string) || null;
  const term = (req.query.term as string) || null;
  const deliveryMethod = (req.query.delivery_method as string) || null;
  const sortBy = (req.query.sort_by as string) || 'date_uploaded';
  const sortOrder = (req.query.sort_order as string) || 'desc';

  try {
    let queryText = getReviewsByCourseIDPaginated;

    const queryParams = [user?.uid || '', courseId];
    let paramCounter = 3;

    if (professorID) {
      const professorFilter = getReviewsByCourseIDWithProfessor.replace(/\$PLACEHOLDER/g, `$${paramCounter}`);
      queryText += professorFilter;
      queryParams.push(professorID);
      paramCounter++;
    }

    if (term) {
      const termFilter = getReviewsByCourseIDWithTerm.replace(/\$PLACEHOLDER/g, `$${paramCounter}`);
      queryText += termFilter;
      queryParams.push(term);
      paramCounter++;
    }

    if (deliveryMethod) {
      const deliveryFilter = getReviewsByCourseIDWithDelivery.replace(/\$PLACEHOLDER/g, `$${paramCounter}`);
      queryText += deliveryFilter;
      queryParams.push(deliveryMethod);
      paramCounter++;
    }

    const countQuery = `SELECT COUNT(*) FROM (${queryText}) AS filtered_reviews`;
    const countResult = await pool.query(countQuery, queryParams);
    const totalItems = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / limit);

    queryText += ` ORDER BY reviews.${sortBy} ${sortOrder === 'asc' ? 'ASC' : 'DESC'}`;
    queryText += ` LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
    queryParams.push(limit.toString(), offset.toString());

    const result = await pool.query(queryText, queryParams);

    res.json({
      success: true,
      message: 'Reviews fetched successfully',
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
      data: {},
      meta: {},
    });
  }
});

router.post('/downvote', validateToken, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const { review_id } = req.body;
  let client;

  if (!review_id) {
    res.status(400).json({
      success: false,
      message: 'review_id must be provided to perform this action.',
      data: {},
      meta: {},
    });
    return;
  }

  try {
    client = await pool.connect();
    await client.query('BEGIN');
    const existingVote = await client.query(getExistingVote, [user.uid, review_id]);

    if (!existingVote.rows.length) {
      await client.query(addVote, [user.uid, review_id, 'down']);
      await client.query(updateTotalVotes, [-1, review_id]);
    } else if (existingVote.rows[0].vote == 'down') {
      await client.query(deleteVote, [review_id, user.uid]);
      await client.query(updateTotalVotes, [1, review_id]);
    } else {
      await client.query(updateVote, ['down', review_id, user.uid]);
      await client.query(updateTotalVotes, [-2, review_id]);
    }

    await client.query('COMMIT');
    res.json({
      success: true,
      message: 'Review successfully downvoted',
      data: { review_id, user_id: user.uid },
      meta: {},
    });
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: {},
      meta: {},
    });
  } finally {
    if (client) {
      client.release();
    }
  }
});

router.post('/upvote', validateToken, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const { review_id } = req.body;
  let client;

  if (!review_id) {
    res.status(400).json({
      success: false,
      message: 'review_id must be provided to perform this action.',
      data: {},
      meta: {},
    });
    return;
  }

  try {
    client = await pool.connect();
    await client.query('BEGIN');
    const existingVote = await client.query(getExistingVote, [user.uid, review_id]);

    if (!existingVote.rows.length) {
      await client.query(addVote, [user.uid, review_id, 'up']);
      await client.query(updateTotalVotes, [1, review_id]);
    } else if (existingVote.rows[0].vote == 'up') {
      await client.query(deleteVote, [review_id, user.uid]);
      await client.query(updateTotalVotes, [-1, review_id]);
    } else {
      await client.query(updateVote, ['up', review_id, user.uid]);
      await client.query(updateTotalVotes, [2, review_id]);
    }

    await client.query('COMMIT');
    res.json({
      success: true,
      message: 'Review successfully upvoted',
      data: { review_id, user_id: user.uid },
      meta: {},
    });
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: {},
      meta: {},
    });
  } finally {
    if (client) {
      client.release();
    }
  }
});

router.post('/', validateToken, async (req: AuthenticatedRequest, res: Response) => {
  let client: PoolClient;

  try {
    const { reviewData }: { reviewData: Review } = req.body;

    // Validate request body
    if (!reviewData || !reviewData.course_id || !reviewData.professor_name) {
      res.status(400).json({
        success: false,
        message: 'Missing required review data',
        data: {},
        meta: {},
      });
      return;
    }

    const user = req.user;

    client = await pool.connect();
    await client.query('BEGIN');

    let professorID = '';
    const professor = await client.query(getProfessorID, [
      reviewData.professor_name.trim(),
      reviewData.course_id.trim(),
    ]);

    if (!professor.rows.length) {
      const newProfessor = await client.query(addProfessor, [
        reviewData.professor_name.trim(),
        reviewData.course_id.trim(),
      ]);
      professorID = newProfessor.rows[0].professor_id;
    } else {
      professorID = professor.rows[0].professor_id;
    }

    const review = await client.query(addReview, [
      reviewData.course_id,
      professorID,
      user.uid,
      reviewData.grade,
      reviewData.delivery_method,
      reviewData.workload,
      reviewData.textbook_use,
      reviewData.evaluation_methods,
      reviewData.overall_score,
      reviewData.easy_score,
      reviewData.interest_score,
      reviewData.useful_score,
      reviewData.term_taken,
      reviewData.year_taken,
      reviewData.course_comments?.trim() || '',
      reviewData.professor_comments?.trim() || '',
      reviewData.advice_comments?.trim() || '',
    ]);

    await client.query(addUpvote, [user.uid, review.rows[0].review_id]);

    await client.query('COMMIT');
    res.json({
      success: true,
      message: 'Review successfully added',
      data: { review_id: review.rows[0].review_id },
      meta: {},
    });
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: {},
      meta: {},
    });
  } finally {
    if (client) {
      client.release();
    }
  }
});

router.delete('/:reviewId', validateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { reviewId } = req.params;
  const user = req.user;

  try {
    const result = await pool.query(deleteUserReview, [reviewId, user.uid]);
    res.json({
      success: true,
      message: 'Review successfully deleted',
      data: { reviews_deleted: result.rows.length },
      meta: {},
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete review',
      data: {},
      meta: {},
    });
  }
});

export default router;
