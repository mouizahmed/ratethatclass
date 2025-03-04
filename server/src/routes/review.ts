import express, { Request, Response } from 'express';
import {
  getReviews,
  getReviewsByCourseID,
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
import { isEmailVerified } from '../helpers';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(getReviews);
    res.json(result.rows as Review[]);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

router.get('/courseID/:courseID', validateTokenOptional, async (req: AuthenticatedRequest, res: Response) => {
  const { courseID } = req.params;
  const user = req.user;
  try {
    if (!user) {
      const result = await pool.query(getReviewsByCourseID, ['', courseID]);
      res.json(result.rows as Review[]);
    } else {
      const result = await pool.query(getReviewsByCourseID, [user.uid, courseID]);
      res.json(result.rows as Review[]);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

router.post('/downvote', validateToken, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const { review_id } = req.body;
  let client;

  try {
    if (!review_id) {
      throw new Error('review_id must be provided to perform this action.');
    }

    isEmailVerified(user);

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
    res.json({ message: `Review ID: ${review_id} successfully downvoted by user ID: ${user.uid}` });
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.log(error);
    res.status(500).send(error.message);
  } finally {
    if (client) {
      client.release();
    } else {
      console.log('Failed to acquire a database client.');
    }
  }
});

router.post('/upvote', validateToken, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const { review_id } = req.body;
  let client;

  try {
    if (!review_id) {
      throw new Error('review_id must be provided to perform this action.');
    }

    isEmailVerified(user);

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
    res.json({ message: `Review ID: ${review_id} successfully upvoted by user ID: ${user.uid}` });
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.log(error);
    res.status(500).send(error.message);
  } finally {
    if (client) {
      client.release();
    } else {
      console.log('Failed to acquire a database client.');
      res.status(500).json({
        error: 'Failed to acquire a database client. Please try again later.',
      });
    }
  }
});

router.post('/add', validateToken, async (req: AuthenticatedRequest, res: Response) => {
  let client: PoolClient;

  try {
    const { reviewData }: { reviewData: Review } = req.body;
    const user = req.user;
    isEmailVerified(user);

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
      reviewData.course_comments.trim(),
      reviewData.professor_comments.trim(),
      reviewData.advice_comments.trim(),
    ]);

    await client.query(addUpvote, [user.uid, review.rows[0].review_id]);

    await client.query('COMMIT');
    res.json({ message: 'Review successfully added.' });
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.log(error);
    res.status(500).send(error.message);
  } finally {
    if (client) {
      client.release(); // Release the client if it was acquired
    } else {
      console.log('Failed to acquire a database client.');
      res.status(500).json({
        error: 'Failed to acquire a database client. Please try again later.',
      });
    }
  }
});

router.delete('/delete/id/:reviewID', validateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { reviewID } = req.params;
  const user = req.user;

  try {
    const result = await pool.query(deleteUserReview, [reviewID, user.uid]);
    res.json({ message: `${result.rows.length} reviews deleted.` });
  } catch (error) {
    console.log('Failed to acquire a database client.');
    res.status(500).json({
      error: 'Failed to acquire a database client. Please try again later.',
    });
  }
});

// router.get('/universityID/:universityID', async (req: Request, res: Response) => {
//   const { universityID } = req.params;
//   try {
//     const result = await pool.query(getReviewsByUniversityID, [universityID]);
//     res.json(result.rows as Review[]);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: error.message });
//   }
// });

// router.get('/departmentID/:departmentID', async (req: Request, res: Response) => {
//   const { departmentID } = req.params;
//   try {
//     const result = await pool.query(getReviewsByDepartmentID, [departmentID]);
//     res.json(result.rows as Review[]);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: error.message });
//   }
// });

export default router;
