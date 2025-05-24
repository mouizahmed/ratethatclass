'use client';
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/authContext';
import { redirect } from 'next/navigation';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function Page() {
  return (
    <AuthProvider>
      <RegisterPageInner />
    </AuthProvider>
  );
}

function RegisterPageInner() {
  const { userLoggedIn } = useAuth();

  useEffect(() => {
    if (userLoggedIn) {
      redirect('/profile');
    }
  }, [userLoggedIn]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <RegisterForm />
      </div>
    </div>
  );
}
