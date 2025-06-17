import { UserRepository } from '../repositories/userRepository';
import { auth } from '../firebase/firebase';
import { UniversityRepository } from '../repositories/universityRepository';
import { AccountType } from '../types';

export class UserService {
  private userRepository: UserRepository;
  private universityRepository: UniversityRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.universityRepository = new UniversityRepository();
  }

  async registerUser(email: string, password: string) {
    let newUser;
    try {
      newUser = await auth.createUser({
        email: email.trim(),
        emailVerified: false,
        password: password,
      });

      let accountType: AccountType = 'user';

      // check domain then set user type
      const domainExists = await this.universityRepository.checkDomainExists(email);
      if (domainExists) {
        await auth.setCustomUserClaims(newUser.uid, { account_type: 'student' });
        accountType = 'student';
      } else {
        await auth.setCustomUserClaims(newUser.uid, { account_type: 'user' });
      }

      await this.userRepository.addUser(newUser.uid, email.trim(), accountType);
      const token = await auth.createCustomToken(newUser.uid);

      return {
        data: { token },
        meta: {},
      };
    } catch (error) {
      // If we created a Firebase user but database operation failed, clean up the Firebase account
      if (newUser?.uid) {
        try {
          await auth.deleteUser(newUser.uid);
        } catch (deleteError) {
          console.log('Failed to delete Firebase user after database error:', deleteError);
        }
      }
      throw error; // Re-throw the original error
    }
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
