import React from 'react';
import { AuthProvider } from '@/contexts/authContext';
import { Metadata } from 'next';
import { generateMetadata, generateViewport, SEO_CONFIGS } from '@/lib/seo';
import RegisterPageClient from './RegisterPageClient';

export const metadata: Metadata = generateMetadata(SEO_CONFIGS.register);
export const viewport = generateViewport();

export default function Page() {
  return (
    <AuthProvider>
      <RegisterPageClient />
    </AuthProvider>
  );
}
