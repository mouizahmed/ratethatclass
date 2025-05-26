import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { AuthProvider } from '@/contexts/authContext';
import { Metadata } from 'next';
import { generateMetadata, SEO_CONFIGS } from '@/lib/seo';
import LoginPageClient from './LoginPageClient';

export const metadata: Metadata = generateMetadata(SEO_CONFIGS.login);

export default function Page() {
  return (
    <AuthProvider>
      <LoginPageClient />
    </AuthProvider>
  );
}
