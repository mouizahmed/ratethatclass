import React from 'react';
import { AuthProvider } from '@/contexts/authContext';
import { Metadata } from 'next';
import { noIndex } from '@/lib/seo';
import LoginPageClient from './LoginPageClient';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your Rate That Class account to write reviews and help fellow students.',
  robots: noIndex,
};

export default function Page() {
  return (
    <AuthProvider>
      <LoginPageClient />
    </AuthProvider>
  );
}
