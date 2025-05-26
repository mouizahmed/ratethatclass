import React from 'react';
import { AuthProvider } from '@/contexts/authContext';
import { Metadata } from 'next';
import { generateMetadata, generateViewport, SEO_CONFIGS } from '@/lib/seo';
import LoginPageClient from './LoginPageClient';

export const metadata: Metadata = generateMetadata(SEO_CONFIGS.login);
export const viewport = generateViewport();

export default function Page() {
  return (
    <AuthProvider>
      <LoginPageClient />
    </AuthProvider>
  );
}
