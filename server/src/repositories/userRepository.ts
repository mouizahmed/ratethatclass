import { pool } from '../db/db';
import {
  addUser,
  getUserReviewsPaginated,
  getUserReviewsCount,
  getUserVotedReviewsPaginated,
  getUserVotedReviewsCount,
} from '../db/queries';
import { Review } from '../types';

export class UserRepository {
  async addUser(userId: string, displayName: string, email: string) {
    await pool.query(addUser, [userId, displayName, email]);
  }

  async getUserReviews(userId: string, sortBy: string, sortOrder: string, limit: number, offset: number) {
    const result = await pool.query(getUserReviewsPaginated, [userId, sortBy, sortOrder.toUpperCase(), limit, offset]);
    return result.rows as Review[];
  }

  async getUserReviewsCount(userId: string) {
    const result = await pool.query(getUserReviewsCount, [userId]);
    return parseInt(result.rows[0].count, 10);
  }

  async getUserVotedReviews(
    userId: string,
    voteType: 'up' | 'down',
    sortBy: string,
    sortOrder: string,
    limit: number,
    offset: number
  ) {
    const result = await pool.query(getUserVotedReviewsPaginated, [
      userId,
      voteType,
      sortBy,
      sortOrder.toUpperCase(),
      limit,
      offset,
    ]);
    return result.rows as Review[];
  }

  async getUserVotedReviewsCount(userId: string, voteType: 'up' | 'down') {
    const result = await pool.query(getUserVotedReviewsCount, [userId, voteType]);
    return parseInt(result.rows[0].count, 10);
  }
}
