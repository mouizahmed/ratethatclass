import { AuthenticatedRequest, Review } from 'types';
import { validate } from 'uuid';

export const validateUUID = (input: string): void => {
  if (validate(input) == false) throw new Error('Please enter a valid UUID.');
  else return;
};

export const extractBearerToken = (req: AuthenticatedRequest): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
};

// Public responses never include the reviewer's user_id, only whether the viewer wrote the review
export function toPublicReview({ user_id, ...review }: Review, viewerId?: string): Review {
  return { ...review, is_owner: !!viewerId && user_id === viewerId };
}
