import { validate } from 'uuid';

export const validateUUID = (input: string): void => {
  if (validate(input) == false) throw new Error('Please enter a valid UUID.');
  else return;
};
