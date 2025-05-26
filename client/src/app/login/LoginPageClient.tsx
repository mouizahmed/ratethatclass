'use client';
import React, { useEffect } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/authContext';
import { redirect } from 'next/navigation';

export default function LoginPageClient() {
  const { userLoggedIn } = useAuth();

  useEffect(() => {
    if (userLoggedIn) {
      redirect('/profile');
    }
  }, [userLoggedIn]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
