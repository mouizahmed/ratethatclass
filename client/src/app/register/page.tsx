import React from 'react';
import { AuthProvider } from '@/contexts/authContext';
import { Metadata } from 'next';
import { noIndex } from '@/lib/seo';
import RegisterPageClient from './RegisterPageClient';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Join Rate That Class to write anonymous course reviews and help other students make better decisions.',
  robots: noIndex,
};

export default function Page() {
  return (
    <AuthProvider>
      <RegisterPageClient />
    </AuthProvider>
  );
}
