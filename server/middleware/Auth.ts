import { Response, NextFunction } from 'express';
import { auth } from '../firebase/firebase';
import { AuthenticatedRequest } from 'types';

export const validateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const idToken = req.headers['id_token'];

  if (!idToken || typeof idToken !== 'string' || idToken.trim() === '') {
    res.status(401).send('Missing or invalid ID token.');
    return;
  }

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.log('Token verification error:', error);
    res.status(401).send('Unauthorized. Invalid or expired token.');
  }
};

export const validateTokenOptional = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const idToken = req.headers['id_token'];

  if (!idToken || typeof idToken !== 'string' || idToken.trim() === '') {
    return next();
  }

  try {
    const user = await auth.verifyIdToken(idToken);
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    next();
  }
};

export const validateAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const idToken = req.headers['id_token'];

  if (!idToken || typeof idToken !== 'string' || idToken.trim() === '') {
    res.status(401).send('Missing or invalid ID token.');
    return;
  }

  try {
    const user = await auth.verifyIdToken(idToken);

    if (user.admin !== true) {
      res.status(403).send('Access denied. Admin privileges required.');
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.log('Token verification failed:', error);
    res.status(401).send('Unauthorized. Invalid or expired token.');
  }
};
