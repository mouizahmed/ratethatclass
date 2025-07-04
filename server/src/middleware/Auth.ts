import { Response, NextFunction } from 'express';
import { auth } from '../firebase/firebase';
import { AuthenticatedRequest } from 'types';
import { extractBearerToken } from '../helpers';

export const validateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const idToken = extractBearerToken(req);

  if (!idToken) {
    res.status(401).json({
      success: false,
      message: 'User not logged in',
      data: {},
      meta: {},
    });
    return;
  }

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const user = await auth.getUser(decodedToken.uid);

    if (!user.emailVerified && decodedToken.provider_id !== 'anonymous') {
      res.status(401).json({
        success: false,
        message: 'Email not verified',
        data: {},
        meta: {},
      });
      return;
    }

    if (decodedToken.banned) {
      res.status(401).json({
        success: false,
        message: `Account banned: ${decodedToken.ban_reason || 'No reason provided'}`,
        data: {},
        meta: {},
      });
      return;
    }

    if (decodedToken.admin === true || decodedToken.owner === true) {
      res.status(403).json({
        success: false,
        message: 'Admins and owners cannot perform regular user actions',
        data: {},
        meta: {},
      });
      return;
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    console.log('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Unauthorized. Invalid or expired token.',
      data: {},
      meta: {},
    });
  }
};

export const validateTokenGet = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const idToken = extractBearerToken(req);

  if (!idToken) {
    res.status(401).json({
      success: false,
      message: 'User not logged in',
      data: {},
      meta: {},
    });
    return;
  }

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.log('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Unauthorized. Invalid or expired token.',
      data: {},
      meta: {},
    });
  }
};

export const validateTokenOptional = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const idToken = extractBearerToken(req);

  if (!idToken) {
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
  const idToken = extractBearerToken(req);

  if (!idToken) {
    res.status(401).json({
      success: false,
      message: 'Missing or invalid Authorization token',
      data: {},
      meta: {},
    });
    return;
  }

  try {
    const user = await auth.verifyIdToken(idToken);
    if (user.admin !== true && user.owner !== true) {
      console.log('Admin or owner privileges required.');
      res.status(403).json({
        success: false,
        message: 'Access denied. Admin or owner privileges required.',
        data: {},
        meta: {},
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.log('Token verification failed:', error);
    res.status(401).json({
      success: false,
      message: 'Unauthorized. Invalid or expired token.',
      data: {},
      meta: {},
    });
  }
};

export const validateOwner = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const idToken = extractBearerToken(req);

  if (!idToken) {
    res.status(401).json({
      success: false,
      message: 'Missing or invalid Authorization token',
      data: {},
      meta: {},
    });
    return;
  }

  try {
    const user = await auth.verifyIdToken(idToken);

    if (user.owner !== true) {
      console.log('Owner privileges required.');
      res.status(403).json({
        success: false,
        message: 'Access denied. Owner privileges required.',
        data: {},
        meta: {},
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.log('Token verification failed:', error);
    res.status(401).json({
      success: false,
      message: 'Unauthorized. Invalid or expired token.',
      data: {},
      meta: {},
    });
  }
};
