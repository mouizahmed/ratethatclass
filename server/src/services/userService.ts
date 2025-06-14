import { UserRepository } from '../repositories/userRepository';
import { auth } from '../firebase/firebase';
import { Review } from '../types';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async registerUser(displayName: string, email: string, password: string) {
    const newUser = await auth.createUser({
      email: email.trim(),
      emailVerified: false,
      password: password,
      displayName: displayName.trim(),
    });

    await this.userRepository.addUser(newUser.uid, displayName.trim(), email.trim());
    const token = await auth.createCustomToken(newUser.uid);

    return {
      data: { token },
      meta: {},
    };
  }

  async getUserReviews(userId: string, page: number, limit: number, sortBy: string, sortOrder: string) {
    const offset = (page - 1) * limit;
    const reviews = await this.userRepository.getUserReviews(userId, sortBy, sortOrder, limit, offset);
    const totalItems = await this.userRepository.getUserReviewsCount(userId);
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: reviews,
      meta: {
        current_page: page,
        page_size: limit,
        total_items: totalItems,
        total_pages: totalPages,
      },
    };
  }

  async getUserVotedReviews(
    userId: string,
    voteType: 'up' | 'down',
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: string
  ) {
    const offset = (page - 1) * limit;
    const reviews = await this.userRepository.getUserVotedReviews(userId, voteType, sortBy, sortOrder, limit, offset);
    const totalItems = await this.userRepository.getUserVotedReviewsCount(userId, voteType);
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: reviews,
      meta: {
        current_page: page,
        page_size: limit,
        total_items: totalItems,
        total_pages: totalPages,
      },
    };
  }
}
