'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '@/firebase/firebase';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { AuthenticationContext } from '@/types/auth';
import { ReactChildren } from '@/types';
import { User } from 'firebase/auth';
import { AccountType } from '@/types/user';

interface AuthState {
  userLoggedIn: boolean;
  currentUser: User | null;
  loading: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  accountType: AccountType;
  isEmailUser: boolean;
  setCurrentUser: (user: User | null) => void;
  banned: boolean;
  banReason?: string;
}

const initialState: AuthState = {
  userLoggedIn: false,
  currentUser: null,
  loading: true,
  isAdmin: false,
  isOwner: false,
  accountType: 'anonymous',
  isEmailUser: false,
  setCurrentUser: () => {},
  banned: false,
  banReason: undefined,
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
  const [accountType, setAccountType] = useState<AccountType>('anonymous');

  useEffect(() => {
    let mounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          // If no user is logged in, sign in anonymously
          try {
            const anonymousUser = await signInAnonymously(auth);
            if (mounted) {
              await initializeUser(anonymousUser.user);
            }
          } catch (error) {
            console.log('Error signing in anonymously:', error);
            if (mounted) {
              setLoading(false);
              // Reset all states to initial values
              setCurrentUser(null);
              setUserLoggedIn(false);
              setIsEmailUser(false);
              setBanned(false);
              setBanReason(undefined);
              setIsAdmin(false);
              setIsOwner(false);
              setAccountType('anonymous');
            }
          }
        } else {
          if (mounted) {
            await initializeUser(user);
          }
        }
      } catch (error) {
        console.log('Error in auth state change:', error);
        if (mounted) {
          setLoading(false);
          // Reset all states to initial values
          setCurrentUser(null);
          setUserLoggedIn(false);
          setIsEmailUser(false);
          setBanned(false);
          setBanReason(undefined);
          setIsAdmin(false);
          setIsOwner(false);
          setAccountType('anonymous');
        }
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  async function initializeUser(user: User | null) {
    try {
      if (user) {
        setCurrentUser(user);
        const isEmail = user.providerData.some((provider) => provider.providerId === 'password');
        setIsEmailUser(isEmail);
        setUserLoggedIn(true);

        const idTokenResult = await user.getIdTokenResult();
        setBanned(!!idTokenResult.claims.banned);
        setBanReason((idTokenResult.claims as { ban_reason?: string }).ban_reason || undefined);
        setIsAdmin(!!idTokenResult.claims.admin);
        setIsOwner(!!idTokenResult.claims.owner);
        setAccountType((idTokenResult.claims as { account_type: AccountType }).account_type || 'anonymous');
      } else {
        setCurrentUser(null);
        setUserLoggedIn(false);
        setIsEmailUser(false);
        setBanned(false);
        setBanReason(undefined);
        setIsAdmin(false);
        setIsOwner(false);
        setAccountType('anonymous');
      }
    } catch (error) {
      console.log('Error initializing user:', error);
      // Reset all states to initial values
      setCurrentUser(null);
      setUserLoggedIn(false);
      setIsEmailUser(false);
      setBanned(false);
      setBanReason(undefined);
      setIsAdmin(false);
      setIsOwner(false);
      setAccountType('anonymous');
    } finally {
      setLoading(false);
    }
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
