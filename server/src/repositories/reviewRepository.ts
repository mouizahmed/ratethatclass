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
} from '../db/queries';

export class ReviewRepository {
  async getReviewsPaginated(page: number, limit: number, search: string | null, sortBy: string, sortOrder: string) {
    const offset = (page - 1) * limit;

    const queryText = `${getReviewsPaginated} ORDER BY reviews.${sortBy} ${
      sortOrder === 'asc' ? 'ASC' : 'DESC'
    } LIMIT $1 OFFSET $2`;
    const result = await pool.query(queryText, [limit, offset, search]);

    const countResult = await pool.query(getReviewsCount, [search]);
    const totalItems = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: result.rows as Review[],
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

    queryText += ` ORDER BY reviews.${sortBy} ${sortOrder === 'asc' ? 'ASC' : 'DESC'}`;
    queryText += ` LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
    queryParams.push(limit.toString(), offset.toString());

    const result = await pool.query(queryText, queryParams);

    return {
      data: result.rows as Review[],
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
        reviewData.course_comments?.trim() || '',
        reviewData.professor_comments?.trim() || '',
        reviewData.advice_comments?.trim() || '',
      ]);

      await client.query(addUpvote, [userId, review.rows[0].review_id]);
      await client.query('COMMIT');

      return { review_id: review.rows[0].review_id };
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
