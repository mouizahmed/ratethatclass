import { AuthenticatedRequest } from 'types';
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
