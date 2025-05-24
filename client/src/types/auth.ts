import { User } from 'firebase/auth';

export interface AuthenticationContext {
  userLoggedIn: boolean;
  isEmailUser: boolean;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  loading: boolean;
}
