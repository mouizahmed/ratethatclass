import { auth } from './firebase';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithCustomToken,
  User,
} from 'firebase/auth';
import axios from 'axios';
import { registerAccount } from '@/requests/postRequests';

export const isUserAdmin = async (user: User) => {
  const idTokenResult = await user.getIdTokenResult();
  return idTokenResult.claims.admin;
};

export const isUserOwner = async (user: User) => {
  const idTokenResult = await user.getIdTokenResult();
  return idTokenResult.claims.owner;
};

export const doSignOut = async (): Promise<void> => {
  return await auth.signOut();
};

export const doSignInWithEmailPassword = async (email: string, password: string): Promise<void> => {
  await signInWithEmailAndPassword(auth, email, password);
};

export const doRegistrationWithEmailPassword = async (email: string, password: string) => {
  try {
    const token = await registerAccount(email, password);

    const { user } = await signInWithCustomToken(auth, token);

    await sendEmailVerification(user);

    await user.reload();
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const doForgotPassword = async (email: string) => {
  try {
    await axios.get(`${process.env.NEXT_PUBLIC_URL}/user/email/${email}`).then((response) => {
      if (response.data.length == 0) {
        throw new Error('Account does not exist.');
      }
    });
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};
