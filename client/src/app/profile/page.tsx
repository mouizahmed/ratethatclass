import React from 'react';
import { AuthProvider } from '@/contexts/authContext';
import { Metadata } from 'next';
import { generateMetadata, SEO_CONFIGS } from '@/lib/seo';
import ProfilePageClient from './ProfilePageClient';

export const metadata: Metadata = generateMetadata(SEO_CONFIGS.profile);

export default function ProfilePage() {
  return (
    <AuthProvider>
      <ProfilePageClient />
    </AuthProvider>
  );
}
