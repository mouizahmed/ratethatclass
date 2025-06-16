'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '@/firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { AuthenticationContext } from '@/types/auth';
import { ReactChildren } from '@/types';
import { User } from 'firebase/auth';
import { AccountType } from '@/types/user';

const initialState: AuthenticationContext = {
  userLoggedIn: false,
  isEmailUser: false,
  currentUser: null,
  setCurrentUser: () => {},
  loading: true,
  banned: false,
  banReason: undefined,
  isAdmin: false,
  isOwner: false,
  accountType: undefined,
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
  const [banned, setBanned] = useState<boolean>(false);
  const [banReason, setBanReason] = useState<string | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [accountType, setAccountType] = useState<AccountType | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, initializeUser);
    return unsubscribe;
  }, []);

  async function initializeUser(user: User | null) {
    if (user && user.isAnonymous == false) {
      setCurrentUser(user);
      const isEmail = user.providerData.some((provider) => provider.providerId === 'password');
      setIsEmailUser(isEmail);
      setUserLoggedIn(true);
      // Check for banned, admin, and owner claims
      const idTokenResult = await user.getIdTokenResult();
      setBanned(!!idTokenResult.claims.banned);
      setBanReason((idTokenResult.claims as { ban_reason?: string }).ban_reason || undefined);
      setIsAdmin(!!idTokenResult.claims.admin);
      setIsOwner(!!idTokenResult.claims.owner);
      setAccountType((idTokenResult.claims as { account_type?: AccountType }).account_type || undefined);
    } else {
      setCurrentUser(null);
      setUserLoggedIn(false);
      setIsEmailUser(false);
      setBanned(false);
      setBanReason(undefined);
      setIsAdmin(false);
      setIsOwner(false);
      setAccountType(undefined);
    }
    setLoading(false);
  }

  const value: AuthenticationContext = {
    userLoggedIn,
    isEmailUser,
    currentUser,
    setCurrentUser,
    loading,
    banned,
    banReason,
    isAdmin,
    isOwner,
    accountType,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
