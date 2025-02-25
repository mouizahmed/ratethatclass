import { Response, NextFunction } from 'express';
import { auth } from '../firebase/firebase';
import { AuthenticatedRequest } from 'types';

export const validateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const { id_token } = req.headers;
  try {
    if (!id_token || typeof id_token !== 'string' || id_token.trim() === '') {
      throw new Error('Please enter a valid id_token to perform this action.');
    }

    const user = await auth.verifyIdToken(id_token);

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

export const validateTokenOptional = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id_token } = req.headers;

  if (!id_token || typeof id_token !== 'string' || id_token.trim() === '') {
    return next();
  }

  try {
    const user = await auth.verifyIdToken(id_token);
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
};
