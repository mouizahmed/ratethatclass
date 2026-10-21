import { pool } from '../db/db';
import { Review } from '../types';
import { PoolClient } from 'pg';
import {
  getReviewsPaginated,
  getReviewsCount,
  getReviewsByCourseIdPaginated,
  getReviewsByCourseIdWithProfessor,
  getReviewsByCourseIdWithTerm,
  getReviewsByCourseIdWithDelivery,
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
  addAnonymousUser,
  lockUserCourse,
  findDuplicateReview,
} from '../db/queries';
import { toPublicReview } from '../helpers';

// Only these columns may be interpolated into ORDER BY; anything else falls back to the default
const REVIEW_SORT_COLUMNS = ['date_uploaded', 'votes', 'overall_score', 'easy_score', 'useful_score'];

function orderBy(sortBy: string, sortOrder: string) {
  const column = REVIEW_SORT_COLUMNS.includes(sortBy) ? sortBy : 'date_uploaded';
  return ` ORDER BY reviews.${column} ${sortOrder === 'asc' ? 'ASC' : 'DESC'}`;
}

/**
 * Adds a review (and its professor, if new) to a course inside the caller's transaction and returns its id.
 * The same submission sometimes arrives twice at once, so this locks on user + course and returns the
 * existing review when an identical one from the same user was already posted today.
 */
export async function insertReview(client: PoolClient, courseId: string, reviewData: Review, userId: string) {
  await client.query(lockUserCourse, [userId, courseId]);

  const professorName = reviewData.professor_name.trim();
  const professor = await client.query(getProfessorID, [professorName, courseId]);
  const professorId = professor.rows.length
    ? professor.rows[0].professor_id
    : (await client.query(addProfessor, [professorName, courseId])).rows[0].professor_id;

  const courseComments = reviewData.course_comments?.trim() || '';
  const professorComments = reviewData.professor_comments?.trim() || '';
  const adviceComments = reviewData.advice_comments?.trim() || '';

  const duplicate = await client.query(findDuplicateReview, [
    userId,
    courseId,
    professorId,
    reviewData.overall_score,
    reviewData.easy_score,
    reviewData.interest_score,
    reviewData.useful_score,
    courseComments,
    professorComments,
    adviceComments,
  ]);
  if (duplicate.rows.length) {
    return duplicate.rows[0].review_id as string;
  }

  const review = await client.query(addReview, [
    courseId,
    professorId,
    userId,
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
    courseComments,
    professorComments,
    adviceComments,
  ]);
  const reviewId = review.rows[0].review_id as string;
  await client.query(addUpvote, [userId, reviewId]);
  return reviewId;
}

export class ReviewRepository {
  async getReviewsPaginated(page: number, limit: number, search: string | null, sortBy: string, sortOrder: string) {
    const offset = (page - 1) * limit;

    const queryText = `${getReviewsPaginated}${orderBy(sortBy, sortOrder)} LIMIT $1 OFFSET $2`;
    const result = await pool.query(queryText, [limit, offset, search]);

    const countResult = await pool.query(getReviewsCount, [search]);
    const totalItems = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: (result.rows as Review[]).map((review) => toPublicReview(review)),
      meta: {
        current_page: page,
        page_size: limit,
        total_items: totalItems,
        total_pages: totalPages,
      },
    };
  }

  async getUserVotes(userId: string, reviewIds: string[]) {
    const result = await pool.query(
      `
      SELECT * 
      FROM user_votes 
      WHERE user_id = $1 AND review_id = ANY($2::uuid[])
    `,
      [userId, reviewIds]
    );

    return result.rows;
  }

  async getOwnedReviewIds(userId: string, reviewIds: string[]): Promise<string[]> {
    const result = await pool.query('SELECT review_id FROM reviews WHERE user_id = $1 AND review_id = ANY($2::uuid[])', [
      userId,
      reviewIds,
    ]);
    return result.rows.map((row) => row.review_id);
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
    const offset = (page - 1) * limit;
    let queryText = getReviewsByCourseIdPaginated;
    const queryParams = [userId, courseId];
    let paramCounter = 3;

    if (professorID) {
      const professorFilter = getReviewsByCourseIdWithProfessor.replace(/\$PLACEHOLDER/g, `$${paramCounter}`);
      queryText += professorFilter;
      queryParams.push(professorID);
      paramCounter++;
    }

    if (term) {
      const termFilter = getReviewsByCourseIdWithTerm.replace(/\$PLACEHOLDER/g, `$${paramCounter}`);
      queryText += termFilter;
      queryParams.push(term);
      paramCounter++;
    }

    if (deliveryMethod) {
      const deliveryFilter = getReviewsByCourseIdWithDelivery.replace(/\$PLACEHOLDER/g, `$${paramCounter}`);
      queryText += deliveryFilter;
      queryParams.push(deliveryMethod);
      paramCounter++;
    }

    const countQuery = `SELECT COUNT(*) FROM (${queryText}) AS filtered_reviews`;
    const countResult = await pool.query(countQuery, queryParams);
    const totalItems = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / limit);

    queryText += orderBy(sortBy, sortOrder);
    queryText += ` LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
    queryParams.push(limit.toString(), offset.toString());

    const result = await pool.query(queryText, queryParams);

    return {
      data: (result.rows as Review[]).map((review) => toPublicReview(review, userId)),
      meta: {
        current_page: page,
        page_size: limit,
        total_items: totalItems,
        total_pages: totalPages,
      },
    };
  }

  async handleVote(userId: string, reviewId: string, voteType: 'up' | 'down') {
    let client: PoolClient;

    try {
      client = await pool.connect();
      await client.query('BEGIN');

      // First ensure the user exists in the users table
      await client.query(addAnonymousUser, [userId]);

      const existingVote = await client.query(getExistingVote, [userId, reviewId]);

      if (!existingVote.rows.length) {
        await client.query(addVote, [userId, reviewId, voteType]);
        await client.query(updateTotalVotes, [voteType === 'up' ? 1 : -1, reviewId]);
      } else if (existingVote.rows[0].vote === voteType) {
        await client.query(deleteVote, [reviewId, userId]);
        await client.query(updateTotalVotes, [voteType === 'up' ? -1 : 1, reviewId]);
      } else {
        await client.query(updateVote, [voteType, reviewId, userId]);
        await client.query(updateTotalVotes, [voteType === 'up' ? 2 : -2, reviewId]);
      }

      await client.query('COMMIT');
      return { review_id: reviewId, user_id: userId };
    } catch (error) {
      if (client) {
        await client.query('ROLLBACK');
      }
      throw error;
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  async createReview(reviewData: Review, userId: string) {
    let client: PoolClient;

    try {
      client = await pool.connect();
      await client.query('BEGIN');

      // First ensure the user exists in the users table
      await client.query(addAnonymousUser, [userId]);

      const reviewId = await insertReview(client, reviewData.course_id, reviewData, userId);
      await client.query('COMMIT');

      return { review_id: reviewId };
    } catch (error) {
      if (client) {
        await client.query('ROLLBACK');
      }
      throw error;
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  async removeReview(reviewId: string, userId: string) {
    let client: PoolClient;

    try {
      client = await pool.connect();
      await client.query('BEGIN');

      // First ensure the user exists in the users table
      await client.query(addAnonymousUser, [userId]);

      const result = await client.query(deleteUserReview, [reviewId, userId]);
      if (result.rowCount === 0) {
        throw new Error('Review not found or you do not have permission to delete it');
      }

      await client.query('COMMIT');
      return { review_id: reviewId };
    } catch (error) {
      if (client) {
        await client.query('ROLLBACK');
      }
      throw error;
    } finally {
      if (client) {
        client.release();
      }
    }
  }
}
