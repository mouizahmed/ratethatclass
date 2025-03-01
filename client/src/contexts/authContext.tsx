'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '@/firebase/firebase';
// import { GoogleAuthProvider } from "firebase/auth";
import { onAuthStateChanged } from 'firebase/auth';
import { AuthenticationContext, ReactChildren } from '@/types';
import { User } from 'firebase/auth';

const initialState: AuthenticationContext = {
  userLoggedIn: false,
  isEmailUser: false,
  currentUser: null,
  setCurrentUser: () => {},
};

const AuthContext = createContext<AuthenticationContext>(initialState);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: ReactChildren) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false);
  const [isEmailUser, setIsEmailUser] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, initializeUser);
    return unsubscribe;
  }, []);

  async function initializeUser(user: User | null) {
    if (user && user.isAnonymous == false) {
      setCurrentUser(user);

      // check if provider is email and password login
      const isEmail = user.providerData.some((provider) => provider.providerId === 'password');
      setIsEmailUser(isEmail);

      // check if the auth provider is google or not
      //   const isGoogle = user.providerData.some(
      //     (provider) => provider.providerId === GoogleAuthProvider.PROVIDER_ID
      //   );
      //   setIsGoogleUser(isGoogle);

      setUserLoggedIn(true);
    } else {
      setCurrentUser(user);
      setUserLoggedIn(false);
    }

    setLoading(false);
  }

  const value: AuthenticationContext = {
    userLoggedIn,
    isEmailUser,
    currentUser,
    setCurrentUser,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
