import React from 'react';
import { AuthProvider } from '@/contexts/authContext';
import { Metadata } from 'next';
import { generateMetadata, generateViewport, SEO_CONFIGS } from '@/lib/seo';
import ProfilePageClient from './ProfilePageClient';

export const metadata: Metadata = generateMetadata(SEO_CONFIGS.profile);
export const viewport = generateViewport();

export default function ProfilePage() {
  return (
    <AuthProvider>
      <ProfilePageClient />
    </AuthProvider>
  );
}
