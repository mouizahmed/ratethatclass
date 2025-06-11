import { Response, NextFunction } from 'express';
import { auth } from '../firebase/firebase';
import { AuthenticatedRequest } from 'types';

export const validateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const idToken = req.headers['id_token'];

  if (!idToken || typeof idToken !== 'string' || idToken.trim() === '') {
    res.status(401).json({
      error: 'AUTH_ERROR',
      message: 'User not logged in',
    });
    return;
  }

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const user = await auth.getUser(decodedToken.uid);

    if (!user.emailVerified) {
      res.status(401).json({
        error: 'AUTH_ERROR',
        message: 'Email not verified',
      });
      return;
    }

    if (decodedToken.banned) {
      res.status(401).json({
        error: 'AUTH_ERROR',
        message: `Account banned: ${decodedToken.ban_reason || 'No reason provided'}`,
      });
      return;
    }

    if (decodedToken.admin === true || decodedToken.owner === true) {
      res.status(403).json({
        error: 'AUTH_ERROR',
        message: 'Admins and owners cannot perform regular user actions',
      });
      return;
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    console.log('Token verification error:', error);
    res.status(401).json({
      error: 'AUTH_ERROR',
      message: 'Unauthorized. Invalid or expired token.',
    });
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
    // await auth.setCustomUserClaims(user.uid, { owner: true });
    console.log(user.admin);
    if (user.admin !== true && user.owner !== true) {
      console.log('Admin or owner privileges required.');
      res.status(403).send('Access denied. Admin or owner privileges required.');
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.log('Token verification failed:', error);
    res.status(401).send('Unauthorized. Invalid or expired token.');
  }
};
