'use client';
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/authContext';
import { redirect } from 'next/navigation';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPageClient() {
  const { userLoggedIn, currentUser } = useAuth();

  useEffect(() => {
    if (userLoggedIn && currentUser && !currentUser.isAnonymous) {
      redirect('/profile');
    }
  }, [userLoggedIn, currentUser]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <RegisterForm />
      </div>
    </div>
  );
}
