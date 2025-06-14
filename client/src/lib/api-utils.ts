import { AxiosError } from 'axios';
import { getCurrentUser } from '../firebase/auth';

export async function getIdToken() {
  const currentUser = await getCurrentUser();
  return currentUser ? await currentUser.getIdToken(true) : '';
}

export function handleApiError(error: unknown, defaultMessage: string): never {
  if (error instanceof AxiosError && error.response?.data?.message) {
    throw new Error(error.response.data.message);
  }
  throw new Error(defaultMessage);
}

export function getRequestConfig(idToken?: string) {
  const config: { headers?: { Authorization: string } } = {};
  if (idToken) {
    config.headers = { Authorization: `Bearer ${idToken}` };
  }
  return config;
}
