import { DecodedIdToken } from 'firebase-admin/auth';
import { v4 as uuid, validate } from 'uuid';

export const validateUUID = (input: string): void => {
  if (validate(input) == false) throw new Error('Please enter a valid UUID.');
  else return;
};

export const isEmailVerified = (user: DecodedIdToken): void => {
  if (!user.email_verified) throw new Error('Email must be verified to perform this action.');
};
